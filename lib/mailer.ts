import nodemailer from 'nodemailer';

export async function sendMail({to, subject, html, text}:{to:string; subject:string; html?:string; text?:string}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM ?? 'ExoMix <no-reply@exomix.cz>',
    to, subject, html, text
  });
  return info.messageId;
}
