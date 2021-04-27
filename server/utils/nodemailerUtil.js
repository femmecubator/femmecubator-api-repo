// remove dotenv when fully integrated with forgot-password middleware
// require('dotenv').config();
const nodemailer = require('nodemailer');
const { EMAIL, PASSWORD } = process.env;

class NodeMailerUtil {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: 'alt3.aspmx.l.google.com',
      // port: 587,
      // secure: false,
      auth: { user: EMAIL, pass: PASSWORD }
    });
  }

  generateMailOptions(variant, email, options) {
    const mailOptions = {
      from: EMAIL,
      to: email,
    };
    switch (variant) {
      case 'FORGOT_PASSWORD_VALID':
        mailOptions.subject = 'Forgot Password';
        mailOptions.text = `Someone requested a forgot password for ${email}, ${options.resetLink}`;
        console.log('FORGOT_PASSWORD_VALID', mailOptions);
        break;
      case 'FORGOT_PASSWORD_INVALID':
        mailOptions.subject = 'Forgot Password';
        mailOptions.text = `Someone requested a forgot password for ${email}`;
        console.log('FORGOT_PASSWORD_INVALID', mailOptions);
        break;
      default:
        return false;
    }
    return mailOptions;
  }

  async sendMail(variant, email, options) {
    const mailOptions = this.generateMailOptions(variant, email, options);
    // if (mailOptions) {
    //   this.transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //       return console.log(error);
    //     };
    //     console.log('message sent', info);
    //   });
    // }
  }


}


module.exports = new NodeMailerUtil;
// const nodeMailerUtil = new NodeMailerUtil;
// nodeMailerUtil.sendMail();