import { Router } from 'express';
import { getBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter.all('/', authenticateToken).get('/', getBooking);

export { bookingRouter };
