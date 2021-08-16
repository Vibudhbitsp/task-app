const sgMail = require('@sendgrid/mail');



sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to:email,
    from:'v.shukla052002@gmail.com',
    subject:'Welcome msg',
    text:`Hi ${name}, Welcome to the app!`,
  })
}

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to:email,
    from:'v.shukla052002@gmail.com',
    subject:'Delete account',
    text:`Hi ${name}, Your request to delete account has been approved,do give suggestions for us to improve`,
})}

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail
}
