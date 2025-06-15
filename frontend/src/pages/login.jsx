import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
function Login() {
    const navigate = useNavigate();

    const ForgotPassword = async () => {
       try {
         const response=await axios.post('http://localhost:3000/forgot-password', {
            email: document.getElementById('email').value
        },{
            withCredentials: true, // Include cookies in the request
        });
        if (response.status === 200) {
            alert("Password reset link sent to your email!");   
        } else {
            alert("Failed to send password reset link. Please try again.");
        }
       } catch (error) {
        console.error("Error sending password reset link:", error);
        alert("An error occurred while sending the password reset link. Please try again.");    
       }
    }   

    const submit = async (e) => {
        e.preventDefault();     
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const response = await axios.post('http://localhost:3000/login', {
            email: email,   
            password:password},
            {
                withCredentials: true, // Include cookies in the request
            }
            );
        const data = response;
        console.log("Response", data.message);
        if(response.status === 200) {
            alert("Login successful!"); 
            navigate('/home'); // Navigate to profile page on successful login
        } else {
            alert("Login failed: " + data.message);
        }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Login failed. Please check your credentials and try again.");
        }
    }

    const Register = (e) => {
        e.preventDefault(); // Prevent default anchor behavior
        navigate('/verify-email'); // Navigate to registration page   
    }
    return ( 
       <>
       <form className="login-form" onSubmit={submit}>
           <h2>Login</h2>           
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
               </div>

                <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />
                </div>

                <button type="submit">Login</button>
                 <p>Don't have an account? <a onClick={Register}>Register</a></p> {/*TODO : */}
                <p><a  onClick={ForgotPassword}>Forgot Password?</a></p>
              </form>
       </>
     );
}

export default Login;