import { Booking } from '@prisma/client';
import bookingRepository from '@/repositories/booking-repository';
import { notFoundError } from '@/errors';

async function getBookingByUserId(userId: number) {
  const booking = await bookingRepository.getBookingByUserId(userId);
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}

const bookingService = { getBookingByUserId };
export default bookingService;
