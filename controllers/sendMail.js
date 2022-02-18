const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS
} = process.env

const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
)

// send mail
const sendEmail = (to, url, txt) => {
  oauth2Client.setCredentials({
    refresh_token: MAILING_SERVICE_REFRESH_TOKEN
  })

  const accessToken = oauth2Client.getAccessToken()
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: SENDER_EMAIL_ADDRESS,
      clientId: MAILING_SERVICE_CLIENT_ID,
      clientSecret: MAILING_SERVICE_CLIENT_SECRET,
      refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
      accessToken
    }
  })

  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to: to,
    subject: 'Truyen online',
    html: `
        <div style="max-width: 700px; margin:auto; border: 1px solid #ddd; padding: 50px 20px; font-size: 110%; border-radius: 5px;">
        <h2 style="text-align: center; text-transform: uppercase;color: #f48097;">Chào mừng đến với Truyen Online.</h2>
        <hr>
        <br>
        <p>Xin chúc mừng! Bạn sắp là thành viên chính thức của Truyen Online. Chỉ cần nhấp vào nút bên dưới để xác thực địa chỉ email của bạn.
        </p>

        <a href=${url} style="background: #f697aa; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;border-radius: 5px;">${txt} &raquo;</a>

        <p>Nếu nút không hoạt động vì bất kỳ lý do gì, bạn cũng có thể nhấp vào liên kết bên dưới:</p>

        <div>${url}</div>
        </div>
    `
  }

  smtpTransport.sendMail(mailOptions, (err, infor) => {
    if (err) return err
    return infor
  })
}

module.exports = sendEmail
