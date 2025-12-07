import { Router } from 'express';
import controller from '@/modules/root/controller';

const router = Router();

router.get('/', controller.index);

export default router;
