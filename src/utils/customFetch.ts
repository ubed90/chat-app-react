import axios from 'axios';

const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_SERVER_URI + '/api/v1'
  : '/api/v1';

const customFetch = axios.create({
  baseURL,
});

customFetch.interceptors.request.use(
  (config) => {
    if(import.meta.env.DEV) {
      config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    console.log(error);
  }
);

export default customFetch;
