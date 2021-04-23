// remove dotenv when fully integrated with forgot-password middleware
require('dotenv').config();
const nodemailer = require('nodemailer');
const { EMAIL, PASSWORD } = process.env;

console.log(EMAIL, PASSWORD);
const mailOptions = {
  from: EMAIL,
  to: 'jacksoncdev@gmail.com',
  subject: 'test',
  text: 'some text'
};

class NodeMailerUtil {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: 'alt3.aspmx.l.google.com',
      // port: 587,
      // secure: false,
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      }
    });
  };

  sendMail() {
    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      };
      console.log('message sent', info);
    });
  }


};

const nodeMailerUtil = new NodeMailerUtil;
nodeMailerUtil.sendMail();