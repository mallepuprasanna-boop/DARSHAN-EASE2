import API from './api';

export const createBooking = async (bookingData) => {
  const { data } = await API.post('/bookings', bookingData);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await API.get('/bookings');
  return data;
};

export const getTicketByBookingId = async (bookingId) => {
  const { data } = await API.get(`/tickets/${bookingId}`);
  return data;
};
