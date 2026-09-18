import type { ContactFormData } from '../src/types/contact'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toHtmlParagraph(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br />')
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:14px 28px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#0f7a72;font-weight:700;">
        ${escapeHtml(label)}
      </td>
    </tr>
    <tr>
      <td style="padding:6px 28px 12px;font-size:16px;line-height:1.6;color:#101418;border-bottom:1px solid #e8eef1;">
        ${value}
      </td>
    </tr>
  `
}

export function buildEnquirySubject(subject: string): string {
  return subject ? `New Website Enquiry - ${subject}` : 'New Website Enquiry'
}

export function buildEnquiryText(data: ContactFormData): string {
  const subject = data.subject || 'Not provided'

  return [
    'New Website Enquiry',
    '',
    'Name:',
    data.name,
    '',
    'Email:',
    data.email,
    '',
    'Phone:',
    data.phone,
    '',
    'Subject:',
    subject,
    '',
    'Message:',
    data.message,
  ].join('\n')
}

export function buildEnquiryHtml(data: ContactFormData): string {
  const subject = data.subject ? toHtmlParagraph(data.subject) : 'Not provided'

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New Website Enquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#101418;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8ea;">
            <tr>
              <td style="padding:28px 28px 16px;border-bottom:3px solid #0f7a72;">
                <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#0f7a72;font-weight:700;">
                  Portfolio contact
                </p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#101418;">
                  New Website Enquiry
                </h1>
              </td>
            </tr>
            ${row('Name', escapeHtml(data.name))}
            ${row('Email', escapeHtml(data.email))}
            ${row('Phone', escapeHtml(data.phone))}
            ${row('Subject', subject)}
            ${row('Message', toHtmlParagraph(data.message))}
            <tr>
              <td style="padding:18px 28px 24px;font-size:12px;line-height:1.5;color:#6b7780;">
                Reply directly to this email to respond to the sender.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
