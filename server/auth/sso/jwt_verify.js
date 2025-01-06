

const ISSUER = "simple-sso";
const jwt = require("jsonwebtoken");
const verifyJwtToken = token =>
  new Promise((resolve, reject) => {
    const { publicKey } = require("./keys");
    jwt.verify(
      token,
      // publicKey,
      "gearvn-internal-key",
      { algorithms: ["HS256"] },
      (err, decoded) => {
        if (err) return reject(err);
        return resolve(decoded);
      }
    );
  });
module.exports = Object.assign({}, { verifyJwtToken });
