const jwt = require("jsonwebtoken");

const config = process.env;
function grantAccess(role) {
  return (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["token"];
    //Token not present
    if (!token) {
      return res.status(200).json({
        status: "error",
        details: "A token is required to call this api"
      });
    }

    //Client Access
    if (role === "client") {
      console.log(role);
      try {
        const decoded = jwt.verify(token, config.JWT_TOKEN);
        if (decoded.role !== "client") throw "Not client";
        console.log(decoded);
        req.user = decoded;
      } catch (err) {
        return res.status(200).json({
          status: "error",
          details: "Invalid Token"
        });
      }
      next();
    }

    //Admin Access
    else if (role === "admin") {
      try {
        const decoded = jwt.verify(token, config.JWT_TOKEN);
        if (decoded.role !== "admin") throw "Not admin";
        console.log(decoded);
        req.user = decoded;
      } catch (err) {
        return res.status(200).json({
          status: "error",
          details: "Invalid Token"
        });
      }
      next();
    }

    //Common Access
    else if (role === "common") {
      try {
        const decoded = jwt.verify(token, config.JWT_TOKEN);
        console.log(decoded);
        req.user = decoded;
      } catch (err) {
        return res.status(200).json({
          status: "error",
          details: "Invalid Token"
        });
      }
      next();
    }
  };
}
module.exports = grantAccess;
