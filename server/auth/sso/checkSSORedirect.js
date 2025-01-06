const url = require("url");
const axios = require("axios");
const moment = require("moment");
const { verifyJwtToken } = require("./jwt_verify");

//const updateUserSession = require("../../utils/updateUserSession");

const ssoRedirect = (ssoServerJWTURL) => {
  return async function (req, res, next) {
    // check if the req has the queryParameter as ssoToken
    // and who is the referer.
    const { ssoToken } = req.query;
    if (ssoToken != null) {
      // to remove the ssoToken in query parameter redirect.
      const redirectURL = url.parse(req.url).pathname;
      const ssoServerHost = url.parse(ssoServerJWTURL);

      try {
        const response = await axios.get(
          `${ssoServerHost.protocol}//${ssoServerHost.host}/authorize?ssoToken=${ssoToken}`,
          {
            headers: {
              cookie: req.headers.cookie,
              Authorization: "Bearer l1Q7zkOL59cRqWBkQ12ZiGVW2DBL"
            },
            validateStatus: (status) => {
              return status >= 200 && status <= 500; // default
            }
          }
        );
        if (response.data.success && response.data.success == true) {

          let { token, user, depots, stores, exp, permissions, permission } = response.data.data;
          const decoded = await verifyJwtToken(token);
          // now that we have the decoded jwt, use the,
          // global-session-id as the session id so that
          // the logout can be implemented with the global session.

          req.session.user = decoded;
          req.session.cookie.expires = new Date(moment(exp, 'DD-MM-YYYY HH:mm:ss').format('MM-DD-YYYY HH:mm:ss'));

          let { username, id } = user.profile

          let dataUpdateSession = {
            authUserId: id,
            username,
            token
          }

          //updateUserSession(dataUpdateSession)

          // return res.redirect(`${redirectURL}`);
          return res.render("exchangeToken", {
            redirectURL: redirectURL,
            token: JSON.stringify({ token: token, expired_at: exp }),
            user: JSON.stringify(user),
            depots: JSON.stringify(depots),
            stores: JSON.stringify(stores),
            permissions: JSON.stringify(permissions),
            permission: JSON.stringify(permission),
            title: "SSO-Consumer | Home"
          });
        } else {
          return res.redirect(`/`);
          // return next(new Error(response.data.messages));

        }
      } catch (err) {
        return next(err);
      }

      return res.redirect(`${redirectURL}`);
    }

    return next();
  };
};

module.exports = ssoRedirect;
