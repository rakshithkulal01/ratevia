import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './authRoutes.js';
import businessRouter from './businessRoutes.js';
import qrRouter from './qrRoutes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/business', businessRouter);
router.use('/qr', qrRouter);

export default router;
