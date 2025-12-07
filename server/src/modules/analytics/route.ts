import { Router } from 'express';
import controller from '@/modules/analytics/controller';
import { protectOwner } from '@/middlewares/protectOwner';
import { protectRoute } from '@/middlewares/protectRoute';

const router = Router();

router.get('/sales/daily', protectOwner, protectRoute, controller.getDailySales);
router.get('/sales/forecast', protectOwner, protectRoute, controller.getForecast);

// Booking funnel and performance endpoints
router.get('/bookings/funnel', protectOwner, protectRoute, controller.getFunnel);
router.get('/bookings/category-performance', protectOwner, protectRoute, controller.getCategoryPerformance);
router.get('/bookings/heatmap', protectOwner, protectRoute, controller.getHeatmap);
router.get('/bookings/compare', protectOwner, protectRoute, controller.getCompare);

// Customer analytics
router.get('/customers/segments', protectOwner, protectRoute, controller.getCustomerSegments);

// CSV exports
router.get('/export/category-performance.csv', protectOwner, protectRoute, controller.exportCategoryCsv);
router.get('/export/heatmap.csv', protectOwner, protectRoute, controller.exportHeatmapCsv);
router.get('/export/customer-segments.csv', protectOwner, protectRoute, controller.exportCustomerSegmentsCsv);

export default router;
