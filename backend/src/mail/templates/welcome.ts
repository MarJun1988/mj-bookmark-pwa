import { baseTemplate } from './baseTemplate.js'

export const welcomeTemplate = (firstName: string) => {
  return {
    subject: 'Willkommen 👋',
    text: `
Hallo ${firstName},

schön, dass du dabei bist.
Dein Konto wurde erfolgreich aktiviert.
`,
    html: baseTemplate({
      title: 'Willkommen 👋',
      content: `
        <p>Hallo ${firstName},</p>
        <p>
          schön, dass du dabei bist.<br>
          Dein Konto wurde erfolgreich aktiviert.
        </p>

        <p style="margin-top:24px;">
          Viel Spaß mit der App 🚀
        </p>
      `,
    }),
  }
}
