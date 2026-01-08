// plugins/mailer.js
import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';

export default fp(async function (server) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  server.decorate('mailer', transporter);
});
