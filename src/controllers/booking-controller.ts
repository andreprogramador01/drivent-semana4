import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.userId;

  try {
    const booking = await bookingService.getBookingByUserId(Number(userId));
    res.status(httpStatus.OK).send(booking);
  } catch (err) {
    next(err);
  }
}
export async function createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.userId;
  const { roomId } = req.body;
  try {
    const bookingId = await bookingService.createBooking(Number(roomId), Number(userId));

    res.status(httpStatus.OK).send(bookingId);
  } catch (error) {
    next(error);
  }
}
