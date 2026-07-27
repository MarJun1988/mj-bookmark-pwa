type BaseTemplateProps = {
  title: string
  content: string
}

export const baseTemplate = ({ title, content }: BaseTemplateProps) => {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;padding:24px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="24"
          style="background:#ffffff;border-radius:8px;">
          <tr>
            <td>
              <h2 style="margin-top:0;">${title}</h2>
              ${content}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
              <p style="font-size:12px;color:#6b7280;">
                Diese E-Mail wurde automatisch erstellt.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  `
}
