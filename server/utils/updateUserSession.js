const sequelize = require("../models/database/gearvn_account_management");
const AuthServices = require("../services/auth.services")

module.exports = async (dataUpdateSession) => {
  try {
    let {
      token = "",
      authUserId = null
    } = dataUpdateSession

    let user = await sequelize.query(
      `CALL SP_AUTH_GET_USER_BY_AUTH_ID(?)`
      , { replacements: [authUserId] }
    )

    //TODO get user permissions by email

    if (!user || !user[0]) throw "Forbidden"
    user = user[0]

    let { user_id } = user

    await sequelize.query(
      `CALL SP_AUTH_INSERT_USER_TOKEN(:id, :token)`,
      {
        replacements: { id: user_id, token },
      }
    )

    // await AuthServices.login(dataUpdateSession)
  }
  catch (err) {
    
  }


}


