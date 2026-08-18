import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (!originalRequest) {
      return Promise.reject(err);
    }

    const is401 = err.response?.status === 401;

    const isLoginRequest =
      originalRequest.url?.includes('/auth/login');

    const isRefreshRequest =
      originalRequest.url?.includes('/auth/refresh-token');

    if (is401 && isRefreshRequest) {
      window.dispatchEvent(new Event('auth:logout'));

      return Promise.reject(
        new Error('Session expired. Please log in again.')
      );
    }

    if (
      is401 &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true, });

        return api(originalRequest);
      } catch (refreshErr) {
        window.dispatchEvent(new Event('auth:logout'));

        return Promise.reject(new Error('Session expired. Please log in again.'));
      }
    }

    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export async function getItems(resource, page = 1, limit = 10) {
  const { data } = await api.get(
    `/admin/${resource}?page=${page}&limit=${limit}`
  );

  return data;
}

export async function getItemById(resource, id) {
  const { data } = await api.get(`/admin/${resource}/${id}`);
  return data;
}

export async function createItem(resource, payload) {
  const { data } = await api.post(`/admin/${resource}`, payload);
  return data;
}

export async function updateItem(resource, id, payload) {
  const { data } = await api.put(`/admin/${resource}/${id}`, payload);
  return data;
}

export async function deleteItem(resource, id) {
  const { data } = await api.delete(`/admin/${resource}/${id}`);
  return data;
}

export async function bulkDeleteItems(resource, ids) {
  const { data } = await api.delete(`/admin/${resource}/bulk-delete`, { data: { ids }, });

  return data;
}

export default api;