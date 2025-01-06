require("dotenv").config();

const backendUrl = process.env.REACT_APP_API_URL;
const pimApiUrl = process.env.REACT_APP_PIM_API_URL;
const nhanhApiUrl = process.env.REACT_APP_NHANH_PROXY_API;
const hiGearvnApiUrl = process.env.REACT_APP_HI_GEARVN_API_URL;

console.log("backendUrl", process.env.REACT_APP_NHANH_PROXY_API);

module.exports = {
  "/api": {
    target: backendUrl,
    changeOrigin: true,
    secure: false,
  },
  "/v1": {
    target: pimApiUrl,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/v1": "", // Remove the /v1 prefix when proxying to PIM API
    },
  },
  "/nhanh": {
    target: nhanhApiUrl,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/nhanh": "",
    },
  },
  "/hi-gearvn": {
    target: hiGearvnApiUrl,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
      "^/hi-gearvn": "",
    },
  },
};
