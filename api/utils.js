var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const grantAccess = require("./middleware/verifytoken");

/*
Change password
*/
router.patch("/resetpwd", grantAccess("common"), async function (req, res) {
  const { old_password, new_password } = req.body;

  console.log(req.user.user_id);
  const user = await prisma.users.findUnique({
    where: {
      user_id: req.user.user_id,
    },
  });

  if (user && (await bcrypt.compare(old_password, user.password))) {
    const encryptedPassword = await bcrypt.hash(new_password, 10);
    try {
      await prisma.users.update({
        where: {
          user_id: req.user.user_id,
        },
        data: {
          password: encryptedPassword,
        },
      });
      res.status(200).json({
        status: "Success",
      });
    } catch (err) {
      return res.status(200).json({
        status:"error",
        details:"Failed to update password"
      });
    }
  } else {
    return res.status(200).json({
      status: "error",
      details: "Incorrect Current Password"
    });
  }
});

function Hello (){
console.log("Report")
}

module.exports = router , Hello;
