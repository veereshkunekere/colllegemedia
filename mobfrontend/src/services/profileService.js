import API from './api';

export const getUserById = async (userId) => {
  const res = await API.get(`/user/${userId}`);
  return res.data.user;
};
