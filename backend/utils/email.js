// Stub for sending emails. Replace with real provider (e.g. nodemailer, SendGrid, etc.)
export async function sendEmail({ to, subject, text, html }) {
  console.log('Email sent (stub):', { to, subject, text });
  // Implement real email sending here
  return true;
}
