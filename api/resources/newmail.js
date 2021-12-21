const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function mail(email, password) {

  const emailid = email;
  const passwordpass = password;

  
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "email@gmail.com", 
      pass: "password", 
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'email', // sender address
    to: `${emailid}`, // list of receivers
    subject: 'From the Director of Admissions - Login Credentials for Gifts Inventory System', // Subject line
    text: `Dear user, please note the following credentials to access your Gifts Inventory System account.
        Email id is ${emailid} and 
        Your password is ${passwordpass}` 
       // html: 'can add html content too'  // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

mail().catch(console.error);
module.exports = {mail};
