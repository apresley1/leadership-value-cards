import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM_ADDRESS;
const fromName = process.env.EMAIL_FROM_NAME;
const ccEmail = process.env.CC_EMAIL;

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}) => {
  try {
    const result = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
      to: [to],
      cc: [ccEmail || ''],
      subject,
      html,
      attachments: attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content
      })),
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}; 