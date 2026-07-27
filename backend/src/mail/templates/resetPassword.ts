import { baseTemplate } from './baseTemplate.js'

export const resetPasswordTemplate = (firstName: string, resetUrl: string) => {
  return {
    subject: 'Passwort zurücksetzen',
    text: `
Hallo ${firstName},

du hast ein neues Passwort angefordert.

${resetUrl}

Der Link ist 1 Stunde gültig.
`,
    html: baseTemplate({
      title: 'Passwort zurücksetzen',
      content: `
        <p>Hallo ${firstName},</p>
        <p>du hast ein neues Passwort angefordert.</p>

        <p style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}"
            style="
              background:#ef4444;
              color:#ffffff;
              padding:12px 20px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
            ">
            Passwort zurücksetzen
          </a>
        </p>

        <p style="font-size:13px;color:#555;">
          Der Link ist 1 Stunde gültig.
        </p>
      `,
    }),
  }
}
