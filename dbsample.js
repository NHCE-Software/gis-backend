const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function dbinit() {
  const user = await prisma.users.findUnique({
    where: {
      user_id: 1,
    },
  });
  const password = "123456789";
  const encryptedPassword = await bcrypt.hash(password, 10);

  if (user === null) {
    console.log("Added sample users to DB");

    await prisma.users.createMany({
      data: [
        {
          user_id: 1,
          dept: "Admin",
          email_id: "admin@nhce.com",
          password: encryptedPassword,
        },
      ],
    });
  } else {
    console.log("Admin Added");
  }
}

module.exports = { dbinit };
