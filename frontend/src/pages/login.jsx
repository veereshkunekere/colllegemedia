import React from 'react';
import api from '../util/api';
import { useState,useEffect } from 'react';
import { Link, replace, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
function Login() {
    const navigate = useNavigate();
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [showPassword,setShowPassword]=useState(false);
    const {authuser,isLoggingIn,login}=useAuthStore();

    const ForgotPass=async (e)=>{
      // e.preventDefault();
      try {
        const result=await api.post("/auth/forgot-password",{email:email});
        console.log(result)
        if(result.status===200){
          console.log("Email sent")
        }
      } catch (error) {
        console.log(error)
      }
    }

   const Login=async (e)=>{
    e.preventDefault();
   try {
     const response=await login(email,password); //authstore login method
     if(response?.status === 200) {
            navigate('/home',{replace:true}); // Navigate to profile page on successful login
        } else {
            alert("Login failed: " + response.data);
        }
   } catch (error) {
    console.error("Login error:", error);
   }
 }

const toggleButton=(e)=>{
    e.preventDefault();
    setShowPassword(!showPassword)
}

useEffect(() => {
    if (authuser) {
      navigate('/home', { replace: true });
    }
  }, [authuser, navigate]);


    return(
        <div className="h-screen w-screen bg-[#FCD8CD] p-8 flex justify-center items-center">
  <div className="bg-[#FEEBF6] h-3/4 w-full max-w-md rounded-2xl flex flex-col gap-6 items-center flex-shrink-0 p-6">
    <h1 className="font-bold text-3xl text-gray-900 p-4">Login</h1>

    <form onSubmit={Login} className="flex flex-col gap-6 w-full">
      <input
        type="email"
        onChange={(e)=>setEmail(e.target.value)}
        placeholder="Enter your email"
        className="bg-white h-12 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 px-4"
      />
     <div className='relative w-full'>
         <input
        type={showPassword?"text":"password"}
        onChange={(e)=>{setPassword(e.target.value)}}
        placeholder="Enter password"
        className="bg-white h-12 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 px-4"
      />
      <button type='button' className='absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-600' onClick={toggleButton}>{showPassword?<VisibilityIcon/>:<VisibilityOffIcon/>}</button>
     </div>
      <button type='submit' className="h-12 w-full bg-yellow-400 rounded-xl text-white font-medium hover:bg-yellow-500">
        {isLoggingIn?"Singing In....":"Signin"}
      </button>
    </form>

    <p onClick={()=>ForgotPass()} className="text-lg font-light cursor-pointer m-8">Forgot password?</p>

    <Link
      to="/verify-email"
      className="text-xl text-blue-600 hover:underline font-medium"
    >
      ---Create Account---
    </Link>
  </div>
</div>

    )
}

export default Login;