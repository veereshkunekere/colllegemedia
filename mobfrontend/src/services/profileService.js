import API from './api';

export const getUserById = async (userId) => {
  const res = await API.get(`/user/${userId}`);
  return res.data.user;
};

export const getProfile = async () => {
  const res = await API.get('/user/profile');
  return res.data.data;
};
 
// Update the logged-in user's profile.
// updates: { username, bio, link, image: { uri, name, type } }
export const updateProfile = async (updates) => {
  const formData = new FormData();
 
  if (updates.username !== undefined) formData.append('username', updates.username);
  if (updates.bio !== undefined) formData.append('bio', updates.bio);
  if (updates.link !== undefined) formData.append('link', updates.link);
 
  if (updates.image) {
    formData.append('image', {
      uri: updates.image.uri,
      name: updates.image.name || 'profile.jpg',
      type: updates.image.type || 'image/jpeg',
    });
  }
 
  const res = await API.put('/user/profile/edit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
 
  return res.data; // { message, user }
};

export const getPostsByUser = async (userId) => {
  const res = await API.get(`/tweet/user/${userId}`);
  return res.data.tweets;
};
 
// Get a user's uploaded files (for the Profile "Uploads" grid)
export const getUploadsByUser = async (userId) => {
  const res = await API.get(`/upload/user/${userId}`);
  return res.data.uploads;
};