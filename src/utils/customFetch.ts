import axios from 'axios';

const baseURL = '/api/v1';

const customFetch = axios.create({
  baseURL,
});

customFetch.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    return config;
  },
  (error) => {
    console.log(error);
  }
);

export default customFetch;
