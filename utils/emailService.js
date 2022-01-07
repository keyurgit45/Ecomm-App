const nodemailer = require('nodemailer')

mailHelper = async (options) => {
    // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "e0d15d8731fe33",
      pass: "4e74d85bee33c5"
    }
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: '"Keyur Gandhi" <keyur8605416464@gmail.com>', // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    // html: "<a>Hello world?</a>", // html body
  });


}

module.exports = mailHelper