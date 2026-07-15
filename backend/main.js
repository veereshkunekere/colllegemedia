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
const conversationRoute=require("./routers/conversation.router");

const socketManager=require('./controllers/socketManager');
const { meta } = require('./util/sendMail');
const {authLimiter,apiLimiter} = require("./middleware/rateLimiter.middleware")

const app=express();
const port=process.env.PORT || 3000;
const originLink = process.env.NODE_ENV==="production" ? process.env.FRONTEND_WEB_URL : process.env.LOCAL_IP_URL ;
app.set('trust proxy', 1); // Trust the first proxy (if behind a reverse proxy)
console.log("CORS Origin Link:", originLink);
app.use(cors({
    // origin:"http://localhost:5173", // Replace with your frontend URL in development
    origin: originLink, // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow cookies to be sent with requests
}));
app.use(require("helmet")());
app.use(require("hpp")());
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));  
app.use(cookieParser());

app.use("/api", apiLimiter);

const mounts = [
    { path: "/api/user", router: userRoute },
    { path: "/api/admin", router: adminRoute },
    { path: "/api/tweet", router: tweetRoute },
    { path: "/api/upload", router: uploadRoute },
    { path: "/api/auth", router: authRoute },
    { path: "/api/messages" , router:conversationRoute},
    { path: "/api/messages", router: messageRoute },  //This route is for non encrypted messages 
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

server.listen(port,'0.0.0.0',(req,res)=>{
    console.log(`Server is running on http://localhost:${port}`);
    db();
})


