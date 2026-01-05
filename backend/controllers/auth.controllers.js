const User=require("../models/user.models");
const crypto=require("crypto");
const transporter=require("../util/nodemailer");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs")

const authController={};

authController.dsignup=async (req,res)=>{
    const {username,email, password,role,department,batch,course} = req.body;
    const user=new User({
        username:username,
        email:email,
        password:password,
        role:role,
    });
    user.save();

}

authController.verifyEmail=async (req,res)=>{
     const {email,password}=req.body;
    //  console.log(email,password)
      if(!email.includes('@mvsrec.edu.in')){
         console.log("email invalid")
         return res.status(400).json({message: "Invalid email address"});
     }
      const isUserExists= await User.findOne({email:email,isVerified:true});
     if(isUserExists){
         console.log("user exists")
         return res.status(400).json({message: "User already exists with this email"});
     }
     try {
         const newUser=new User({
             password:password,
             email:email
         });
        const verificationToken=crypto.randomBytes(32).toString('hex');
        const verificationTokenHash=crypto.createHash('sha256').update(verificationToken).digest('hex');
        const verificationExpires = Date.now() + 3600000; // 1 hour from now
        newUser.verificationToken=verificationTokenHash;
        newUser.verificationExpires=verificationExpires;
        await newUser.save();
        // console.log("verifiaction token geneerated",verificationToken);
        // console.log("hashed verification token generated",verificationTokenHash)
        // console.log(newUser);
        const verifyEmailLink=`http://localhost:5173/register/${verificationToken}`
        const message=`Click the below link to verify the Email ${verifyEmailLink}`;
        try {
         const info=await transporter.sendMail({
             to:newUser.email,
             subject:"Email verification",
             text:message
         })
         // console.log(info);
        } catch (error) {
          console.log("error sending verification email")
        }
        return res.status(201).json({message:"sent verification email successfully",data:verifyEmailLink})
     } catch (error) {
         console.log("ërror in verifying email",error);
         res.status(201).json({message:"error in verification email"})
     }
  }

authController.verifyToken=async (req,res)=>{
    try {
        console.log("Verifying token for user ID:", req.user);
            const user=await User.findById(req.user).select('-password');
    if(user){
        // console.log("user authorized")
      return res.status(200).json({data:"authorized",user});
    }
    // console.log("user authorized")
    return res.status(401).json({data:"unauthorized",
        user:user
    });
  }
    catch (err) {
      return res.status(401).json({message:"token invalid or expired"});
    }
}

 authController.registerUser= async (req, res) => {
    const token=req.params.token;
    console.log(token)
    console.log("Registration request received with body:", req.body);
    const {username,email, password,role,department,batch,course} = req.body;
    if(!username || !email || !password || !role || !department || !batch || !course || !token){
        console.log("Missing fields in registration request:", req.body);
        return res.status(400).json({message: "All fields are required"});
    }
    if(password.length < 6){
        return res.status(400).json({message: "Password must be at least 6 characters long"});
    }
    if(!email.includes('@mvsrec.edu.in')){
        return res.status(400).json({message: "Invalid email address"});
    }
    if(!['student', 'teacher', 'hod', 'principal', 'alumini'].includes(role)){
        return res.status(400).json({message: "Invalid role"});
    }
    if(!username.match(/^[a-zA-Z0-9]+$/) && username!=="anonymous"){
        return res.status(400).json({message: "Username can only contain letters and numbers"});
    }
    if(!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
        return res.status(400).json({message: "Invalid email format"});
    }
    if(!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)){
        return res.status(400).json({message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"});
    }
    if(!department || !['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Other'].includes(department)){
        return res.status(400).json({message: "Invalid department"});   
    }
    if(!batch || !/^\d{4}$/.test(batch)){ // Check if batch is a 4-digit number
        return res.status(400).json({message: "Invalid batch"});
    }
    if(!course || !['B.Tech', 'M.Tech', 'PhD','MBA','MCA', 'Other'].includes(course)){
        return res.status(400).json({message: "Invalid course"});
    }

    const isUserExists= await User.findOne({email});

    if(isUserExists.isVerified===true){
        return res.status(400).json({message: "User already exists with this email"});
    }

    const verifiactionTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log("toke recieved",token);
    console.log("hashed token",verifiactionTokenHash);
    const user = await User.findOne({       
        verificationToken: verifiactionTokenHash,
        verificationExpires: { $gt: Date.now() } // Check if token is still valid
    });
    if(!user){
        return res.status(201).json({message:"email not verified i.e token unauthorized"});
    }
    try{
        user.username = username;
        user.role = role;
        user.department = department;
        user.batch = batch;
        user.course = course;
        user.isVerified=true;
        user.uploads = {
             notes: [],
             questionPaper: [],
             labManual: [],
             assignment: [],
             syllabus: [],
             other: []
           };
        user.links=[],
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        const savedUSer=await user.save();
        res.status(200).json({message: "User registered successfully", user: savedUSer});
    }catch(error){  
        console.error("Error saving user:", error);
        res.status(500).json({message: "Internal server error"});
    }    
 }

  authController.ForgotPassword= async (req, res) => {
      const {email} = req.body;   
      if(!email){
          return res.status(400).json({message: "Email is required"});
      }
      const user=await User.findOne({email:email});
      if(!user){
          return res.status(400).json({message: "User not found"});
      }
      const resetToken = crypto.randomBytes(32).toString('hex');
      console.log("Generated reset token:", resetToken);
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      console.log("Reset token hash:", resetTokenHash);
      const resetExpires = Date.now() + 3600000; // 1 hour from now
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = resetExpires;
      await user.save();
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`; // URL to reset password
      // Send email with reset link
      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`; 
      try {
          console.log("Email user:", process.env.MAIL);
          console.log("Email pass:", process.env.MAIL_PASSWORD ? "*****" : "Not set");
          console.log("Sending email to:", user.email);
          console.log("Reset URL:", resetUrl);
          console.log("Message content:", message);
          // Send the email using nodemailer
  
          const info=await transporter.sendMail({
              to: user.email,
              subject: 'Password Reset Request',
              text: message,
          });
          console.log("Email sent:", info.response);
          // Optionally, you can send a success response to the client
          res.status(200).json({message: "Password reset email sent"});
      } catch (error) {
          console.error("Error sending email:", error);
          res.status(500).json({message: "Internal server error"});
      }
  }

  authController.ResetPassword= async (req, res) => {
      console.log("Reset password request received with body:", req.body.newPassword);
      const {token} = req.params; 
      const {newPassword} = req.body;
  
      if(!token || !newPassword){
          console.log("Token or new password is missing");
          return res.status(400).json({message: "Token and password are required"});
      }
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({       
          resetPasswordToken: resetTokenHash,
          resetPasswordExpires: { $gt: Date.now() } // Check if token is still valid
      });
      if(!user){
          return res.status(400).json({message: "Invalid or expired token"});
      }
      if(newPassword.length < 6){
          return res.status(400).json({message: "Password must be at least 6 characters long"});
      }
      if(!newPassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/)){
          return res.status(400).json({message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"});
      }
      user.password = newPassword;
      user.resetPasswordToken = null; // Clear the reset token
      user.resetPasswordExpires = null; // Clear the expiration time
      try {
          await user.save();
          res.status(200).json({message: "Password reset successful"});
      } catch (error) {
          console.error("Error resetting password:", error);
          res.status(500).json({message: "Internal server error"});
      }
  }

  authController.Login= async (req, res) => {
      console.log("Login request received with body:", req.body);
      const {email, password} = req.body; 
      if(!email || !password){
          return res.status(400).json({message: "Email and password are required"});
      }
      const user = await User.findOne({email:email});
      if(!user){          
          return res.status(400).json({message: "User not found"});
      }
  
      console.log("User found:");
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if(!isPasswordValid){
        console.log("Invalid password for user:", email);
          return res.status(400).json({message: "Invalid password"});
      }

      const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn: '24h'}); // Generate JWT token
      res.cookie('token',token, {
          expires: new Date(Date.now() + 24*3600000), // 1 hour expiration
          httpOnly:true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'Strict' // Prevent CSRF attacks
      })
      res.status(200).json({message: "Login successful", user});
    }

  authController.Logout= (req, res) => {
    res.clearCookie('token'); // Clear the token cookie 

    res.status(200).json({message: "Logged out successfully"});
}

 authController.resetPasswordDirect = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await require("../models/user.models").findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

 module.exports=authController