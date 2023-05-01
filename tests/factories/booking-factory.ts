import { prisma } from '@/config';

export async function createBookingByRoomId(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}
