import nodemailer from 'nodemailer';
import config from '../src/lib/config.js';
import { text } from 'express';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: config.emailuser,
    clientId: config.googleClient,
    clientSecret: config.googleSecret,
    refreshToken: config.googleRefreshToken,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${config.emailuser}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};



export const SuccessEmail=async(to,subject,text,html)=>{
  try {
    const info = await transporter.sendMail({
      from: `"Your Name" <${config.emailuser}>`, // sender address
      to, // list of receivers  
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    
  }
}