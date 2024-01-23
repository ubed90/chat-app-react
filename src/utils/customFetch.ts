import axios from 'axios';

const baseURL = 'http://localhost:3000/api/v1';

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
