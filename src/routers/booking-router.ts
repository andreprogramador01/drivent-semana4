import { Router } from 'express';
import { createBooking, getBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter.all('/', authenticateToken).get('/', getBooking).post('/', createBooking);

export { bookingRouter };
