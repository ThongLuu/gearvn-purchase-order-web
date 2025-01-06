import moment from 'moment';
import _ from 'lodash';
import localStorageServices from './localStorage.services';
import configs from './services.configs';
import BaseServices from "./base.services";

class AuthServices extends BaseServices {
  isExpired() {
    let authInfo = localStorageServices.get('token');

    return !authInfo || !authInfo.token || !authInfo.expired_at || moment().unix() >= moment(authInfo.expired_at, 'DD-MM-YYYY HH:mm:ss').unix();
  }

  hasPermission(want) {
    let permission = localStorageServices.get('permission') || [];
    let user = localStorageServices.get('user') || {};
    const { profile = {} } = user;
    const { is_master } = profile;

    if (!permission || !permission.length || !want) {
      return false;
    }

    if (typeof want === 'string') {
      want = [want];
    }
    const admin = is_master === 1;

    return !!_.intersection(permission, want).length || !!admin;
  }
}

export default new AuthServices();