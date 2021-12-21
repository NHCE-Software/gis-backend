var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

router.post("/login", async function (req, res, next) {
  const { email, password } = req.body;
  console.log(email);
  const user = await prisma.users.findUnique({
    where: {
      email_id: email,
    },
  });
  if (user === null) {
    res.json("User not in DB");
  } 
  else {
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.dept === "Admin") {
        const token = jwt.sign(
          { user_id: user.user_id, role: "admin" },
          process.env.JWT_TOKEN
        );
        res.status(200).json({
          dept: user.dept,
          email: user.email_id,
          user_id: user.user_id,
          token: token,
        });
      } else {
        const token = jwt.sign(
          { user_id: user.user_id, role: "client" },
          process.env.JWT_TOKEN,
        
        );
        res.status(200).json({
          dept: user.dept,
          email: user.email_id,
          user_id: user.user_id,
          token: token,
        });
      }
    } else {
      res.json({
        status: "Wrong Password",
      });
    }
  }
});

module.exports = router;
