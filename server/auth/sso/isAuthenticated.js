const url = require("url");
const isAuthenticated = (ssoAuthAddr) => {
  return (req, res, next) => {
    // simple check to see if the user is authenicated or not,
    // if not redirect the user to the SSO Server for Login
    // pass the redirect URL as current URL
    // serviceURL is where the sso should redirect in case of valid user
    let urlPath = req.path;
    if (urlPath === '/login') {
      urlPath = '/dashboard';
    }

    const redirectURL = `${req.protocol}://${req.headers.host}${urlPath}`;
    const ssoAuthAddrHostname = url.parse(ssoAuthAddr);

    if (req.session.user == null) {
      return res.redirect(
        `${ssoAuthAddrHostname.protocol}//${ssoAuthAddrHostname.host}/login?redirect_uri=${redirectURL}`
      );
    }
    next();
  };
}

module.exports = isAuthenticated;
