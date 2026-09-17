import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './authRoutes.js';
import businessRouter from './businessRoutes.js';
import qrRouter from './qrRoutes.js';
import feedbackRouter from './feedbackRoutes.js';
import analyticsRouter from './analyticsRoutes.js';
import adminRouter from './adminRoutes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/business', businessRouter);
router.use('/qr', qrRouter);
router.use('/feedback', feedbackRouter);
router.use('/analytics', analyticsRouter);
router.use('/admin', adminRouter);

export default router;
