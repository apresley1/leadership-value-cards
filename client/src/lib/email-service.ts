import { LeadershipValue, UserInfo } from "@/types";

/**
 * Send email with PDF attachment to user and CC to john@leadershipvalues.com
 */
export const sendPdfEmail = async (
  pdfBase64: string,
  userInfo: UserInfo,
  coreValues: LeadershipValue[]
): Promise<{ success: boolean; error?: any }> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'}/api/send-pdf-email`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfBase64,
        userInfo,
        coreValues,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error sending email:', data);
      return { success: false, error: data.error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}; 