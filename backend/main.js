const dotenv=require('dotenv');
dotenv.config();
const express=require('express');
const bodyParser=require('body-parser');    
const cors=require('cors');
const cookieParser=require('cookie-parser');
const mongoose=require('mongoose');

const userRoute=require("./routers/user.router");
const authRoute=require("./routers/auth.router");
const tweetRoute=require("./routers/tweet.router");
const uploadRoute=require("./routers/upload.router");
const adminRoute=require("./routers/admin.router");
const socketManager=require('./controllers/socketManager');

const app=express();
const port=3000;

const server=require('http').createServer(app);
const io=socketManager(server);

app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent with requests
}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));  
app.use(cookieParser());

app.use("/api/user",userRoute);
app.use("/api/admin",adminRoute);
app.use("/api/tweet",tweetRoute);
app.use("/api/upload",uploadRoute);
app.use("/api/auth",authRoute);

const db=async ()=>{
   try {
    await mongoose.connect(process.env.DB_URL);
   console.log("db connected");
   } catch (error) {
      console.log(error)
   }
}

app.all('*', (req, res) => {
    res.send('404 Page Not Found!');
});


app.listen(port,(req,res)=>{
    console.log(`Server is running on http://localhost:${port}`);
    db();
})