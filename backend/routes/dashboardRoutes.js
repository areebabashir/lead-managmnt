import express from 'express';
import {
    getDashboardOverview,
    getPipelineHealth,
    getSalesPerformance,
    getCampaignPerformance
} from '../controllers/dashboardController.js';
import { requireSignIn } from '../Middlewares/authMiddlewares.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireSignIn);

// Dashboard overview and analytics
router.get('/overview', getDashboardOverview);
router.get('/pipeline-health', getPipelineHealth);

// Performance and reporting
router.get('/sales-performance', getSalesPerformance);
router.get('/campaign-performance', getCampaignPerformance);

export default router;
