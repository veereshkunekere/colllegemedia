const nodemailer=require('nodemailer');
const dotenv=require('dotenv');
dotenv.config();

console.log("Email user:", process.env.MAIL);
console.log("Email pass:", process.env.MAIL_PASSWORD ? "*****" : "Not set");


const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.MAIL,
        pass:process.env.MAIL_PASSWORD,
        },      
});

module.exports=transporter;