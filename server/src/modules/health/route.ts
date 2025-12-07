import { Router } from 'express';
import controller from '@/modules/health/controller';

const router = Router();

router.get('/', controller.index);

export default router;
