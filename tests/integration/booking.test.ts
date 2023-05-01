import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';

import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createTicketTypeWithHotel,
  createUser,
  createHotel,
  createTicket,
  createRoomWithHotelId,
  createBookingByRoomId,
  createTicketTypeNotIncludesHotel,
  createTicketType,
  createTicketTypeRemote,
  createRoomWithHotelIdLimitedOne,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const api = supertest(app);

describe('GET /booking', () => {
  it('should response 401 if token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await api.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should response 404 if user dont have booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);

    const response = await api.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
  it('should response 200 if user have booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBookingByRoomId(room.id, user.id);

    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');
    const response = await api.get('/booking').set('Authorization', `Bearer ${token}`);
    expect(response.status).toEqual(httpStatus.OK);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        Room: { ...room, createdAt: expect.any(String), updatedAt: expect.any(String) },
      }),
    );
  });
});
describe('POST /booking', () => {
  it('should response 401 if token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await api.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should response 403 if ticket is not paid', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();

    const ticket = await createTicket(enrollment.id, ticketType.id, 'RESERVED');

    const response = await api.post('/booking').send({ roomId: 1 }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
  it('should response 403 if ticketType is remote', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();

    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

    const response = await api.post('/booking').send({ roomId: 1 }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
  it('should response 403 if ticketType not includes hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeNotIncludesHotel();

    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

    const response = await api.post('/booking').send({ roomId: 1 }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
  it('should response 403 if room capacity is full', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const hotel = await createHotel();
    const room = await createRoomWithHotelIdLimitedOne(hotel.id);
    const booking = await createBookingByRoomId(room.id, user.id);

    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

    const response = await api.post('/booking').send({ roomId: room.id }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
  it('should response 404 if room doesnot exists', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    const response = await api
      .post('/booking')
      .send({ roomId: room.id + 1 })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });
  it('should response 200 if have a booking', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBookingByRoomId(room.id, user.id);

    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

    const response = await api.post('/booking').send({ roomId: room.id }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.OK);

    expect(response.body).toEqual({ bookingId: expect.any(Number) });
  });
});

describe('PUT /booking', () => {
  it('should response 401 if token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await api.put('/booking/123').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it('should response 403 if booking does not exists', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBookingByRoomId(room.id, user.id);

    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

    const response = await api
      .put(`/booking/${booking.id + 3}`)
      .send({ roomId: room.id })
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
  it('should response 403 if room capacity is full', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const hotel = await createHotel();
    const room = await createRoomWithHotelIdLimitedOne(hotel.id);
    const booking = await createBookingByRoomId(room.id, user.id);

    const ticket = await createTicket(enrollment.id, ticketType.id, 'PAID');

    const response = await api.put('/booking/1').send({ roomId: room.id }).set('Authorization', `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
});
