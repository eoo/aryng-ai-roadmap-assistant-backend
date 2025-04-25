const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, pdfBuffer) {
  const msg = {
    to,
    from: 'tarungarhwal@gmail.com',
    subject: 'Your AI Roadmap Discussion Summary',
    text: 'Please find attached the summary of your AI roadmap discussion.',
    attachments: [
      {
        content: pdfBuffer.toString('base64'),
        filename: 'ai-roadmap-summary.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };
  console.log('sending email... to-', to)
  const res= await sgMail.send(msg);
  console.log('email sent! ', res)
}

module.exports = { sendEmail };
