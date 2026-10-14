import { httpServerHandler } from 'cloudflare:node';
import app from './app.js';
import { runDataRetentionCleanup } from './utils/cleanup.js';
import { runStickerRetentionCleanup } from './services/stickerRetentionService.js';

if (typeof process !== 'undefined' && process.on) {
  process.on('uncaughtException', (err) => {
    console.error('[Worker uncaughtException]:', err?.message || err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[Worker unhandledRejection]:', reason);
  });
}

// Bind Express to internal port for Cloudflare Node bridge
const PORT = 8080;
const server = app.listen(PORT);
server.keepAliveTimeout = 0;
server.headersTimeout = 0;

const httpHandler = httpServerHandler({ port: PORT });

export default {
  /**
   * Cloudflare Worker fetch handler.
   * Invoked for any request not handled by static assets in ./frontend/dist.
   */
  async fetch(request, env, ctx) {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === 'string') {
        process.env[key] = value;
      }
    }
    if (env.HYPERDRIVE?.connectionString) {
      process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
    }

    const url = new URL(request.url);

    // Route API endpoints and uploaded assets through Express
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) {
      try {
        return await httpHandler.fetch(request, env, ctx);
      } catch (err) {
        console.error('[Worker API Error]:', err);
        return new Response(
          JSON.stringify({
            error: 'WorkerExecutionError',
            message: err.message,
            stack: err.stack,
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Delegate SPA client routes and static assets to Cloudflare Assets
    if (env.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status === 404) {
        return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
      }
      return assetResponse;
    }

    return httpHandler.fetch(request, env, ctx);
  },

  /**
   * Cloudflare Worker Cron Trigger handler.
   * Runs automated 30-day feedback and 25-day sticker image retention purges.
   */
  async scheduled(controller, env, ctx) {
    if (env.HYPERDRIVE?.connectionString) {
      process.env.DATABASE_URL = env.HYPERDRIVE.connectionString;
    }
    console.log(`[Ratevia Worker] Scheduled Cron triggered: ${controller.cron}`);
    ctx.waitUntil(
      Promise.allSettled([
        runDataRetentionCleanup(),
        runStickerRetentionCleanup(),
      ])
    );
  },
};
