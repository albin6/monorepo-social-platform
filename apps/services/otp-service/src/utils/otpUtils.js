// src/utils/otpUtils.js

// Generate a random OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Validate OTP format
const isValidOTP = (otp, length = 6) => {
  if (!otp || typeof otp !== 'string') {
    return false;
  }
  
  // Check if OTP has the correct length
  if (otp.length !== length) {
    return false;
  }
  
  // Check if OTP contains only digits
  const otpRegex = new RegExp(`^\\d{${length}}$`);
  return otpRegex.test(otp);
};

// Simulate sending OTP (in production, you would integrate with an SMS/email service)
const sendOTP = async (destination, otp, channel = 'email') => {
  try {
    // In a real application, this would call an SMS or email service
    console.log(`OTP ${otp} sent to ${destination} via ${channel}`);
    
    // For simulation purposes, return success
    return {
      success: true,
      messageId: `otp-${Date.now()}`,
      destination
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateOTP,
  isValidOTP,
  sendOTP
};