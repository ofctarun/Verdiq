import nodemailer from "nodemailer";
import dns from "dns";

function resolveIPv4(hostname) {
    return new Promise((resolve, reject) => {
        dns.resolve4(hostname, (err, addresses) => {
            if (err || !addresses?.length) {
                return reject(err || new Error(`No IPv4 address found for ${hostname}`));
            }
            resolve(addresses[0]);
        });
    });
}

async function getTransporter() {
    // nodemailer resolves both IPv4 and IPv6 for smtp.gmail.com but picks the
    // connecting address at random from the combined list. On hosts without
    // outbound IPv6 routing (e.g. Render) that randomly fails with ENETUNREACH.
    // Resolving IPv4 ourselves and connecting to that literal address sidesteps
    // nodemailer's picker entirely. servername keeps TLS cert validation correct
    // since the cert is issued for the hostname, not the IP.
    const ip = await resolveIPv4("smtp.gmail.com");

    return nodemailer.createTransport({
        host: ip,
        port: 465,
        secure: true,
        tls: {
            servername: "smtp.gmail.com",
        },
        auth: {
            type: "OAuth2",
            user: process.env.GOOGLE_USER,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            clientId: process.env.GOOGLE_CLIENT_ID,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });
}

getTransporter()
    .then((transporter) => transporter.verify())
    .then(() => { console.log("Email transporter is ready to send emails"); })
    .catch((err) => { console.error("Email transporter verification failed:", err); });


export async function sendEmail({ to, subject, html, text }) {

    const mailOptions = {
        from: process.env.GOOGLE_USER,
        to,
        subject,
        html,
        text
    };

    try {
        const transporter = await getTransporter();
        const details = await transporter.sendMail(mailOptions);
        console.log("Email sent:", details.messageId);
    } catch (err) {
        console.error("Failed to send email:", {
            code: err.code,
            responseCode: err.responseCode,
            response: err.response,
            command: err.command,
        });
        throw err;
    }
}
