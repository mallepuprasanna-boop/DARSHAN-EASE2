import API from './api';

export const getTemples = async () => {
  const { data } = await API.get('/temples');
  return data;
};

export const getTempleById = async (id) => {
  const { data } = await API.get(`/temples/${id}`);
  return data;
};

export const getSlots = async (templeId) => {
  const { data } = await API.get(`/slots?templeId=${templeId}`);
  return data;
};
