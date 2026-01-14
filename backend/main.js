const dotenv=require('dotenv');
dotenv.config();
const express=require('express');
const bodyParser=require('body-parser');    
const cors=require('cors');
const cookieParser=require('cookie-parser');
const mongoose=require('mongoose');
const path=require('path');
const userRoute=require("./routers/user.router");
const authRoute=require("./routers/auth.router");
const tweetRoute=require("./routers/tweet.router");
const uploadRoute=require("./routers/upload.router");
const adminRoute=require("./routers/admin.router");
const messageRoute=require("./routers/messages.router");


const socketManager=require('./controllers/socketManager');
const { meta } = require('./util/nodemailer');

const app=express();
const port=process.env.PORT || 3000;

app.use(cors({
    // origin:"http://localhost:5173", // Replace with your frontend URL in development
    origin: 'https://colllegemedia-froontend.onrender.com', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies to be sent with requests
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));  
app.use(cookieParser());

const mounts = [
    { path: "/api/user", router: userRoute },
    { path: "/api/admin", router: adminRoute },
    { path: "/api/tweet", router: tweetRoute },
    { path: "/api/upload", router: uploadRoute },
    { path: "/api/auth", router: authRoute },
    { path: "/api/messages", router: messageRoute },
];

for (const m of mounts) {
    try {
        app.use(m.path, m.router);
        console.log(`Mounted ${m.path}`);
    } catch (err) {
        console.error(`Failed to mount ${m.path}:`, err && err.stack ? err.stack : err);
        throw err;
    }
}


const server=require('http').createServer(app);
socketManager(server);

const db=async ()=>{
   try {
    await mongoose.connect(process.env.DB_URL);
   console.log("db connected");
   } catch (error) {
      console.log(error)
   }
}

server.listen(port,(req,res)=>{
    console.log(`Server is running on http://localhost:${port}`);
    db();
})


