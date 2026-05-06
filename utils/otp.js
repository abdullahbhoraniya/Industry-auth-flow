function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}


function generateOtpHtml(otp) {
    return `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2 style="color: #333;">Your One-Time Password (OTP)</h2>
            <p style="font-size: 18px; color: #555;">Use the following OTP to complete your authentication process:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</div>
            <p style="font-size: 14px; color: #999;">This OTP is valid for a limited time. Please do not share it with anyone.</p>
        </div>
    `;
}

function successEmailHtml() {
    return `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2 style="color: #333;">Email Verification Successful</h2>
            <p style="font-size: 18px; color: #555;">Your email has been verified successfully.</p>
        </div>
    `;
}

export { generateOTP, generateOtpHtml ,successEmailHtml};