import { Router } from 'express';
import controller from '@/modules/booking/controller';
import { protectCustomer } from '@/middlewares/protectCustomer';
import { protectRoute } from '@/middlewares/protectRoute';
import { protectOwner } from '@/middlewares/protectOwner';

const router = Router();

router.post('/create-booking', protectCustomer, protectRoute, controller.createBooking);

router.post(
    '/get-bookings-by-restaurant',
    protectOwner,
    protectRoute,
    controller.getBookingsByRestaurant,
);

router.post(
    '/get-bookings-by-customer',
    protectCustomer,
    protectRoute,
    controller.getBookingsByCustomer,
);

router.post(
    '/change-booking-status-for-restautant',
    protectOwner,
    protectRoute,
    controller.changeBookingStatusR,
);

router.post('/execute-booking', protectOwner, protectRoute, controller.exceuteBooking);

router.post('/payment-callback', controller.paymentCallback);

export default router;
