import { baseTemplate } from './baseTemplate.js'

export const verifyEmailTemplate = (
  firstName: string,
  verifyUrl: string,
  expiresText = '24 Stunden',
) => {
  return {
    subject: 'Bitte bestätige deine E-Mail-Adresse',
    text: `
Hallo ${firstName},

bitte bestätige deine E-Mail-Adresse:

${verifyUrl}

Der Link ist ${expiresText} gültig.
`,
    html: baseTemplate({
      title: 'E-Mail bestätigen',
      content: `
        <p>Hallo ${firstName},</p>
        <p>bitte bestätige deine E-Mail-Adresse.</p>

        <p style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}"
            style="
              background:#3b82f6;
              color:#ffffff;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
            ">
            E-Mail bestätigen
          </a>
        </p>

        <p style="font-size:13px;color:#555;">
          Der Link ist ${expiresText} gültig.
        </p>
      `,
    }),
  }
}
