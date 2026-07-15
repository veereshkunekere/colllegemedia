const dotenv = require("dotenv");
dotenv.config();

const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;

client.authentications["api-key"].apiKey =
    process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendMail({ to, subject, html }) {

  console.log("Sending email to:", to);
    const emailData = new SibApiV3Sdk.SendSmtpEmail();

    emailData.sender = {
        name: "CollegeMedia",
        email: "colllegmedia@gmail.com", // Must be verified in Brevo
    };

    emailData.to = [
        {
            email: to,
        },
    ];

    emailData.subject = subject;
    emailData.htmlContent = html;

   try {
    const result = await apiInstance.sendTransacEmail(emailData);
    console.log("Email sent:", result);
    return result;
} catch (err) {
    console.error("Brevo Error:", err.response?.body || err);
    throw err;
    return;
}
}

module.exports = sendMail;