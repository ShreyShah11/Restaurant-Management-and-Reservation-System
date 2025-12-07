export const verifyEmailTemplate = (OTP: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Email Verification</h2>
      <p>Your OTP code is:</p>
      <h1 style="letter-spacing: 5px;">${OTP}</h1>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
};

export const resetPasswordVerifyTemplate = (OTP: string): string => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Your OTP code for password reset is:</p>
      <h1 style="letter-spacing: 5px;">${OTP}</h1>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
};

export const bookingRejectedTemplate = (
    firstName: string,
    lastName: string,
    category: string,
    bookingAt: string,
    bookingID: string,
): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Dear ${firstName} ${lastName},</p>
          <p>We regret to inform you that your booking has been cancelled by the restaurant.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #dc2626;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${bookingID}</p>
            <p><strong>Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
            <p><strong>Date & Time:</strong> ${new Date(bookingAt).toLocaleString()}</p>
          </div>
          
          <p>We apologize for any inconvenience this may have caused. The restaurant may have cancelled due to capacity constraints or unforeseen circumstances.</p>
          <p>We encourage you to make another reservation or contact the restaurant directly for more information.</p>
          
          <p>Thank you for your understanding.</p>
          <p>Best regards,<br>Restaurant Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const bookingAcceptedTemplate = (
    firstName: string,
    lastName: string,
    category: string,
    bookingAt: string,
    numberOfGuests: number,
    bookingID: string,
    paymentLinkURL: string,
): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .success-icon { font-size: 48px; text-align: center; color: #16a34a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear ${firstName} ${lastName},</p>
          <p>Great news! Your booking has been <strong>confirmed</strong> by the restaurant.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #16a34a;">Reservation Details</h3>
            <p><strong>Booking ID:</strong> ${bookingID}</p>
            <p><strong>Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
            <p><strong>Date & Time:</strong> ${new Date(bookingAt).toLocaleString()}</p>
            <p><strong>Number of Guests:</strong> ${numberOfGuests}</p>
            <p><strong>Payment Link:</strong> <a href="${paymentLinkURL}" target="_blank" style="color: #16a34a;">Complete Your Payment</a></p>
          </div>
          
          <p>Please arrive on time for your reservation. If you need to make any changes or cancel your booking, please contact the restaurant as soon as possible.</p>
          
          <p><strong>Important Reminders:</strong></p>
          <ul>
            <li>Please arrive 5-10 minutes before your reservation time</li>
            <li>Bring a valid ID for verification</li>
            <li>Contact the restaurant if you're running late</li>
          </ul>
          
          <p>We look forward to serving you!</p>
          <p>Best regards,<br>Restaurant Management Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
