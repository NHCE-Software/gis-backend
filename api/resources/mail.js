var nodemailer = require('nodemailer');
var Mail = {};
Mail.sendMail = function(email, password){
    const emailid = email;
    const passwordpass = password;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        tls:{
        rejectUnauthorized:false
    },
    port: 25,
    secureConnection: false,
        auth: {
          user: 'nhcesoftware@gmail.com',
          pass: 'nhcesoftware@123'
        }
      });
      //Currently to mail is kept as self for trsting purpose
      var mailOptions = {
        from: 'nhcesoftware@gmail.com',
        to: `${emailid}`, //Put any mail here for testing.. Change later
        subject: 'From the Director of Admissions - Login Credentials for Gifts Inventory System',
        text: `Dear user, please note the following credentials to access your Gifts Inventory System account.
        Email id is ${emailid} and 
        Your password is ${passwordpass}` 
       // html: 'can add html content too' 
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          console.log('Email - ' + email);
          console.log('Password - ' + password);
        }
      });
}

exports.data = Mail;

