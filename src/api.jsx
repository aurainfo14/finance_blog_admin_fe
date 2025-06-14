import axios from 'axios';

const API_BASE_URL = 'https://blog-be-gxxu.onrender.com/api/blogs';

export const getBlogs = () => axios.get(API_BASE_URL);

export const createBlog = async (formData) => {
  const data = new FormData();
  data.append('title', formData.title);
  data.append('content', formData.content);
  data.append('type', formData.type);
  if (formData.image) {
    data.append('image', formData.image);
  }

  const response = await axios.post(API_BASE_URL, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateBlog = async (id, formData) => {
  const data = new FormData();
  data.append('title', formData.title);
  data.append('content', formData.content);
  data.append('type', formData.type);
  if (formData.image) {
    data.append('image', formData.image);
  }

  const response = await axios.put(`${API_BASE_URL}/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBlog = (id) => axios.delete(`${API_BASE_URL}/${id}`);
