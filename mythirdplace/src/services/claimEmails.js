// Email notification service for venue claims
// Note: This requires backend email service integration (e.g., SendGrid, AWS SES)
// For now, this provides the structure and templates

export const EMAIL_TEMPLATES = {
  claimReceived: {
    subject: 'Venue Ownership Claim Received - MyThirdPlace',
    getContent: (claimData) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #006548;">Claim Received</h2>
        <p>Dear ${claimData.claimantName},</p>
        <p>Thank you for claiming your venue listing on MyThirdPlace. We have received your ownership claim for:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>${claimData.venueName}</strong><br/>
          Claim ID: ${claimData.claimId}
        </div>
        <p>Our team will review your submission and supporting documents within 24-48 hours. You will receive an email notification once your claim has been processed.</p>
        <p>If you have any questions, please reply to this email.</p>
        <p>Best regards,<br/>The MyThirdPlace Team</p>
      </div>
    `
  },

  documentsRequested: {
    subject: 'Additional Documentation Required - Venue Claim',
    getContent: (claimData, requestedDocs) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #006548;">Additional Documentation Needed</h2>
        <p>Dear ${claimData.claimantName},</p>
        <p>We are reviewing your ownership claim for <strong>${claimData.venueName}</strong>.</p>
        <p>To complete the verification process, we need the following additional information:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          ${requestedDocs}
        </div>
        <p>Please reply to this email with the requested documents or information.</p>
        <p>Best regards,<br/>The MyThirdPlace Team</p>
      </div>
    `
  },

  claimApproved: {
    subject: 'Congratulations! Your Venue Claim Approved - MyThirdPlace',
    getContent: (claimData, venueUrl) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #006548;">🎉 Your Claim Has Been Approved!</h2>
        <p>Dear ${claimData.claimantName},</p>
        <p>Great news! Your ownership claim for <strong>${claimData.venueName}</strong> has been approved.</p>
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>✓ Verified Business</strong><br/>
          Your venue now displays a verified business badge.
        </div>
        <h3>What's Next?</h3>
        <ul>
          <li>Update your venue information and photos</li>
          <li>Manage your business hours and contact details</li>
          <li>Connect with customers who are regulars at your venue</li>
          <li>Respond to blog posts about your business</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${venueUrl}" style="background-color: #006548; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Manage Your Venue
          </a>
        </div>
        <p>Welcome to the MyThirdPlace business community!</p>
        <p>Best regards,<br/>The MyThirdPlace Team</p>
      </div>
    `
  },

  claimRejected: {
    subject: 'Venue Claim Update - MyThirdPlace',
    getContent: (claimData, reason) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #006548;">Claim Status Update</h2>
        <p>Dear ${claimData.claimantName},</p>
        <p>Thank you for your interest in claiming <strong>${claimData.venueName}</strong>.</p>
        <p>After careful review, we were unable to verify your ownership claim at this time.</p>
        ${reason ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Reason:</strong><br/>
            ${reason}
          </div>
        ` : ''}
        <p>You may submit a new claim with additional documentation that demonstrates your ownership or authority to manage this venue.</p>
        <p>If you believe this decision was made in error or have questions, please reply to this email.</p>
        <p>Best regards,<br/>The MyThirdPlace Team</p>
      </div>
    `
  },

  ownerWelcome: {
    subject: 'Welcome to MyThirdPlace Business Owners - Getting Started',
    getContent: (claimData, venueUrl) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #006548;">Welcome to MyThirdPlace!</h2>
        <p>Dear ${claimData.claimantName},</p>
        <p>Welcome to the MyThirdPlace business owner community! Here's how to make the most of your verified listing:</p>

        <h3>🏢 Optimize Your Listing</h3>
        <ul>
          <li>Add high-quality photos of your space</li>
          <li>Keep your business hours and contact information up to date</li>
          <li>Add all relevant tags and amenities</li>
          <li>Write a compelling description</li>
        </ul>

        <h3>👥 Connect With Your Community</h3>
        <ul>
          <li>See who marks your venue as their "regular spot"</li>
          <li>Read and respond to blog posts about your venue</li>
          <li>Build relationships with your regular customers</li>
        </ul>

        <h3>📈 Track Your Impact</h3>
        <ul>
          <li>Monitor views and engagement</li>
          <li>See how many people have your venue as a regular spot</li>
          <li>Track blog mentions and community stories</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${venueUrl}" style="background-color: #006548; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Get Started
          </a>
        </div>

        <p>Need help? Reply to this email anytime - we're here to support you!</p>
        <p>Best regards,<br/>The MyThirdPlace Team</p>
      </div>
    `
  }
};

// Send email notification (placeholder - requires backend implementation)
export const sendClaimEmail = async (emailType, recipientEmail, data) => {
  try {
    const template = EMAIL_TEMPLATES[emailType];
    if (!template) {
      throw new Error(`Unknown email template: ${emailType}`);
    }

    // TODO: Implement actual email sending with your email service
    // For now, log the email that would be sent
    console.log('Email to send:', {
      to: recipientEmail,
      subject: template.subject,
      content: template.getContent(data)
    });

    // In production, you would call your email service API here
    // Example with SendGrid:
    // await sendGridClient.send({
    //   to: recipientEmail,
    //   from: 'noreply@mythirdplace.com',
    //   subject: template.subject,
    //   html: template.getContent(data)
    // });

    return { success: true };
  } catch (error) {
    console.error('Error sending claim email:', error);
    throw error;
  }
};

// Log email sent to claim record
export const logEmailSent = async (claimId, emailType) => {
  try {
    // This would update the venueClaims document with email tracking
    // Implementation would use Firestore updateDoc with arrayUnion
    console.log(`Email logged for claim ${claimId}: ${emailType}`);
    return { success: true };
  } catch (error) {
    console.error('Error logging email:', error);
    throw error;
  }
};
