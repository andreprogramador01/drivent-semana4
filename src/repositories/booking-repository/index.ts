import { prisma } from '@/config';

async function getBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}
async function getBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}
async function getRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
}
async function insertBooking(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}
async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}
async function getBookingByBookingId(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
    },
  });
}

export default {
  getBookingByUserId,
  getBookingByRoomId,
  getRoomById,
  insertBooking,
  updateBooking,
  getBookingByBookingId,
};
