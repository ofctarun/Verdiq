import { Resend } from "resend";

let resend;

function getResendClient() {
    if (!resend) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not set");
        }
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

export async function sendEmail({ to, subject, html, text }) {
    try {
        const { data, error } = await getResendClient().emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Verdiq <onboarding@resend.dev>",
            to,
            subject,
            html,
            text,
        });

        if (error) {
            throw new Error(error.message || "Failed to send email via Resend");
        }

        console.log("Email sent:", data?.id);
    } catch (err) {
        console.error("Failed to send email:", err);
        throw err;
    }
}
