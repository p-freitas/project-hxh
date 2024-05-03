require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendEmail(email, code) {
  try {
    const smtpEndpoint = "smtp.gmail.com";

    const port = 587;

    const senderAddress = "Teste";

    var toAddress = email;

    const smtpUsername = "srkingxxx@gmail.com";

    const smtpPassword = process.env.GMAILPW;

    var subject = "Verify your email";

    // The body of the email for recipients
    var body_html = `<!DOCTYPE> 
    <html>
      <body>
        <p>Your authentication code is : </p> <b>${code}</b>
      </body>
    </html>`;

    // Create the SMTP transport.
    let transporter = nodemailer.createTransport({
      host: smtpEndpoint,
      port: port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Specify the fields in the email.
    let mailOptions = {
      from: senderAddress,
      to: toAddress,
      subject: subject,
      html: body_html,
    };

    let info = await transporter.sendMail(mailOptions);
    return { error: false };
  } catch (error) {
    console.error("send-email-error", error);
    return {
      error: true,
      message: "Cannot send email",
    };
  }
}

module.exports = { sendEmail };
