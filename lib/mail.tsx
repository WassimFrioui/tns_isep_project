import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "TSN <noreply@tsn.com>",
    to,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <p>Bonjour,</p>
      <p>Voici votre lien de réinitialisation :</p>
      <p><a href="${link}">${link}</a></p>
      <p>Ce lien expire dans 15 minutes.</p>
    `,
  });
}
