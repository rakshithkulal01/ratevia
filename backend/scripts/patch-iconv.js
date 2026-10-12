import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconvPath = path.join(__dirname, '../node_modules/iconv-lite/lib/index.js');

if (fs.existsSync(iconvPath)) {
  let content = fs.readFileSync(iconvPath, 'utf8');
  if (content.includes('require("./streams")(iconv);')) {
    content = content.replace(
      'require("./streams")(iconv);',
      'var s = require("./streams"); if (typeof s === "function") s(iconv);'
    );
    content = content.replace(
      'require("./extend-node")(iconv);',
      'var e = require("./extend-node"); if (typeof e === "function") e(iconv);'
    );
    fs.writeFileSync(iconvPath, content, 'utf8');
    console.log('[Ratevia] Patched iconv-lite for Cloudflare Workers runtime.');
  }
}
