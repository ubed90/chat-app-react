import axios from 'axios';

const baseURL = '/api/v1';

const customFetch = axios.create({
  baseURL,
});

customFetch.interceptors.request.use(
  (config) => {
    if(import.meta?.env?.DEV || process.env.NODE_ENV === 'development') {
      config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    console.log(error);
  }
);

export default customFetch;
