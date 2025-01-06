const axios = require("axios")

module.exports = {
  login: async (data) => {

    let { token } = data

    try {
      const instance = axios.create({
        baseURL: process.env.BACKEND_HOST,
        headers: {
          token,
          action: "login",
          controller: "auth"
        }
      });

      let rq = await instance.post('/auth/login', data)

      return rq.data || rq

    }
    catch (err) {
      

    }

  }

}






// class AuthServices extends BaseServices {
  // isExpired() {
  //   let authInfo = localStorageServices.get('token');

  //   return !authInfo || !authInfo.token || !authInfo.expired_at || moment().unix() >= moment(authInfo.expired_at, 'DD-MM-YYYY HH:mm:ss').unix();
  // }

  // hasPermission(want) {
  //   let permission = localStorageServices.get('permission') || [];

  //   if (!permission || !permission.length || !want) {
  //     return false;
  //   }

  //   if (typeof want === 'string') {
  //     want = [want];
  //   }

  //   return !!_.intersection(permission, want).length;
  // }


// }

// export default new AuthServices();
