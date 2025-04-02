const nodemailer = require('nodemailer');

if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  throw new Error('Email configuration is missing in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const otpAttempts = new Map();

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.sendOTP = async (email, otp) => {
  const now = Date.now();
  const userAttempts = otpAttempts.get(email) || [];
  
  const recentAttempts = userAttempts.filter(
    timestamp => now - timestamp < 60 * 60 * 1000
  );
  
  if (recentAttempts.length >= 5) {
    throw new Error('Too many OTP requests. Please try again later.');
  }
  
  recentAttempts.push(now);
  otpAttempts.set(email, recentAttempts);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your OTP for ExamEase Verification',
    text: `Your OTP for ExamEase verification is ${otp}. 
    
This code will expire in 10 minutes.

If you didn't request this OTP, please ignore this email.

Best regards,
ExamEase Team`,
    html: `
      <h2>ExamEase Verification</h2>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this OTP, please ignore this email.</p>
      <br>
      <p>Best regards,<br>ExamEase Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [email, attempts] of otpAttempts.entries()) {
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < 60 * 60 * 1000
    );
    if (recentAttempts.length === 0) {
      otpAttempts.delete(email);
    } else {
      otpAttempts.set(email, recentAttempts);
    }
  }
}, 60 * 60 * 1000);