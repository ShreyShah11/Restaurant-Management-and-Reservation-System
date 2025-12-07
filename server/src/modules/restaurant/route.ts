import { protectOwner } from '@/middlewares/protectOwner';
import { protectRoute } from '@/middlewares/protectRoute';
import { Router } from 'express';
import controller from '@/modules/restaurant/controller';
const router = Router();

router.post('/add-restaurant', protectOwner, protectRoute, controller.addRestaurant);
router.post(
    '/get-restaurant-by-owner',
    protectOwner,
    protectRoute,
    controller.getRestaurantByOwner,
);
router.post('/update-restaurant', protectOwner, protectRoute, controller.updateRestaurant);

router.post('/get-near-by-restaurants', protectRoute, controller.getNearByRestaurant);

router.post('/add-item', protectOwner, protectRoute, controller.addItem);
router.post('/delete-item', protectOwner, protectRoute, controller.deleteItem);
router.post('/update-item', protectOwner, protectRoute, controller.updateItem);
router.post(
    '/get-items-by-restaurant',
    protectRoute,
    controller.getItemsByRestaurant,
);

export default router;
