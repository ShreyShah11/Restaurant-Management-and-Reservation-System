import { protectCustomer } from '@/middlewares/protectCustomer';
import { protectRoute } from '@/middlewares/protectRoute';
import { Router } from 'express';
import controller from '@/modules/review/controller';

const router = Router();

router.post('/add-review', protectCustomer, protectRoute, controller.addReview);
router.post('/get-reviews', controller.getReviews);

router.post('/get-ai-summary', protectRoute, controller.getAISummary);

export default router;
