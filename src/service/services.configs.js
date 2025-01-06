export default {
  // host: `${window.location.protocol}//${window.location.hostname}:${window.location.port}/`,
  host: process.env.BACKEND_API,
  auth_host: process.env.AUTH_HOST,
  helper_host: process.env.BACKEND_HELPER,
  promotion_host: process.env.BACKEND_PROMOTION,
  apiVersion: '',
  timeout: 30,
};
