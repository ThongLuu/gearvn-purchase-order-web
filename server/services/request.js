const axios = require("axios")
const _ = require('lodash');

const configs = require("../../src/app/services/configs")
const defaults = require("../../src/app/defaults")

const prepareHeader = (action, controller, headerOpt) => {

  const contentType = { 'Content-Type': defaults.Services.header.ContentType }
  const actionAuth = { action, controller }

  const email = localStorageService.get('token');
  const password = localStorageService.get('password');
  const auth = { email, password }

  const opt = _.isUndefined(headerOpt) ? {} : { ...headerOpt }

  return {
    ...contentType,
    ...actionAuth,
    ...auth,
    ...opt
  }
}

const request = async (method, uri, data, action = null, controller = null) => {
  try {

    var headers = prepareHeader(action, controller)

    if (data && data.auth) {
      headers.email = data.auth.email || ''
      headers.password = data.auth.password || ''
    }

    if (method === 'get') data = { params: data }


    const instance = axios.create({
      baseURL: configs.host + configs.apiVersion,
      headers,
    });

    let rq = await instance[method](uri, data)
    return rq.data || rq
  }
  catch (err) {
    console.log("err", (err && err.response && err.response.data.message) || err)
    throw (err && err.response && err.response.data) || "Đã có lỗi xảy ra, hãy thử đăng nhập lại"
  }

}

module.exports = {
  get: async (uri, data, action, controller) => {
    return request("get", uri, data, action, controller)
  },
  post: async (uri, data, action, controller) => {
    return request("post", uri, data, action, controller)
  },
  put: async (uri, data, action, controller) => {
    return request("put", uri, data, action, controller)

  },

}