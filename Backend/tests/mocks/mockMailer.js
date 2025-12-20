import fp from 'fastify-plugin';
import nodemailer from 'nodemailer';

export default fp(async function (server) {
 const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'monique.erdman@ethereal.email',
        pass: 'TKF2FpJKU52bwCN6V5'
    }
});
server.decorate('mailer', transporter);
});