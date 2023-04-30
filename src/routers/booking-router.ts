import { Router } from 'express';
import { createBooking, getBooking, updateBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter
  .all('/', authenticateToken)
  .get('/', getBooking)
  .post('/', createBooking)
  .put('/:bookingId', updateBooking);

export { bookingRouter };
