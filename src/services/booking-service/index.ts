import { Booking } from '@prisma/client';
import bookingRepository from '@/repositories/booking-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import { forbiddenError, notFoundError } from '@/errors';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function getBookingByUserId(userId: number) {
  const booking = await bookingRepository.getBookingByUserId(userId);
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}
async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
  const booking = await bookingRepository.getBookingByRoomId(roomId);

  const room = await bookingRepository.getRoomById(roomId);

  if (!room) {
    throw notFoundError();
  }
  if (booking.length === room.capacity) {
    throw forbiddenError();
  }
  const newBooking = await bookingRepository.insertBooking(roomId, userId);

  return newBooking.id;
}
async function updateBooking(bookingId: number, roomId: number) {
  const booking = await bookingRepository.getBookingByBookingId(bookingId);

  if (!booking) {
    throw forbiddenError();
  }
  const bookingByRoom = await bookingRepository.getBookingByRoomId(roomId);
  const room = await bookingRepository.getRoomById(roomId);

  if (!room) {
    throw notFoundError();
  }
  if (bookingByRoom.length === room.capacity) {
    throw forbiddenError();
  }
  const updatedBooking = await bookingRepository.updateBooking(bookingId, roomId);

  return updatedBooking.id;
}

const bookingService = { getBookingByUserId, createBooking, updateBooking };
export default bookingService;
