import { mailer } from '../services/mail.service.js'

type SendMailArgs = {
  to: string
  subject: string
  text: string
  html: string
}

export const sendMail = async ({ to, subject, text, html }: SendMailArgs) => {
  await mailer.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  })
}
