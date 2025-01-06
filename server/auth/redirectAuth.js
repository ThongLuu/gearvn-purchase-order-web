const dotenv = require("dotenv");

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: ".env.dev" });
}

const path = require("path");
const url = require("url");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const serverAuthAddr = process.env.AUTH_HOST;
const checkSSORedirect = require("./sso/checkSSORedirect");
const isAuthenticated = require("./sso/isAuthenticated")(serverAuthAddr);

const redirectAuth = (app) => {

  app.use(bodyParser.urlencoded({ extend: true }));
  app.use(cookieParser());
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "ejs");
  app.set("views", path.resolve(__dirname, "../views"));

  app.use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: "gearvn account",
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
    })
  );

  app.use(checkSSORedirect(serverAuthAddr));

  app.get("/", (req, res, next) => {
    const redirectURL = `${req.protocol}://${req.headers.host}${req.path}`,
      ssoAuthAddrHostname = url.parse(serverAuthAddr),
      ssoUrl = `${ssoAuthAddrHostname.protocol}//${ssoAuthAddrHostname.host}/login?redirect_uri=${redirectURL}`;

    if (req.path !== "/") {
      return res.redirect(ssoUrl);
    } else {
      if (req.session.user == null) {
        res.render("home", {
          direct: "/login",
          direct_text: "Đăng nhập",
          user: "Khách",
          auth: false,
          title: "GEARVN | Home",
        });
      } else {
        res.render("home", {
          direct: "/dashboard",
          direct_text: "Dashboard",
          auth: true,
          ssoUrl: ssoUrl,
          user: req.session.user.LoginByUserName,
          title: "GEARVN | Home",
        });
        // next();
      }
    }
  });
  app.get("/login", isAuthenticated, (req, res, next) => {
    // res.render("index", {
    //   user: `SSO-Consumer One ${JSON.stringify(req.session.user)}`,
    //   title: "SSO-Consumer | Home"
    // });

    next();
  });
  app.get("/logout", (req, res, next) => {
    req.session.destroy(function() {
      const redirectURL = `${req.protocol}://${req.headers.host}`,
        ssoServerHost = url.parse(serverAuthAddr);
      res.redirect(
        `${ssoServerHost.protocol}//${ssoServerHost.host}/logout?redirect_uri=${redirectURL}`
      );
    });
  });

  app.get("/*", (req, res, next) => {
    const redirectURL = `${req.protocol}://${req.headers.host}${req.path}`;

    if (req.path !== "/"
      && req.path.indexOf('/public/') === 0
      && req.path.indexOf('/assets/') === 0
      && req.path.indexOf('/media/') === 0
      && req.path.indexOf('/css/') === 0
      && req.path.indexOf('/favicon.ico') === 0
      && req.session.user == null) {
      const ssoAuthAddrHostname = url.parse(serverAuthAddr);

      return res.redirect(
        `${ssoAuthAddrHostname.protocol}//${ssoAuthAddrHostname.host}/login?redirect_uri=${redirectURL}`
      );
    }
    next();
  });
};

module.exports = redirectAuth;
