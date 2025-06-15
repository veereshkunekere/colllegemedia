import axios from "axios";
import React from "react";

function ResetPasswordPage() {
    const submit = async (event) => {
        event.preventDefault();
        console.log(event.target['new-password'].value);
        const newPassword = event.target['new-password'].value
        const confirmPassword = event.target['confirm-password'].value;
        const token=window.location.pathname.split('/').pop(); // Extract the token from the URL
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
           const response=await axios.post(`http://localhost:3000/reset-password/${token}`,{newPassword:newPassword},{
            withCredentials:true,
            })
            if (response.status === 200) {
                alert("Password reset successfully!");
            } else {
                alert("Failed to reset password. Please try again.");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            alert("An error occurred while resetting the password. Please try again.");
        }
        
        // Here you would typically send the new password to your server
        console.log("New password submitted:", newPassword);
    };
    return ( 
        <>
            <h1>Reset Password Page</h1>
            <p>Please enter your new password below.</p>
            <form onSubmit={submit}>
                <div>
                    <label htmlFor="new-password">New Password:</label>
                    <input type="password" id="new-password" name="new-password" required />
                </div>
                <div>
                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <input type="password" id="confirm-password" name="confirm-password" required />
                </div>
                <button type="submit">Reset Password</button>
            </form>
        </>
     );
}

export default ResetPasswordPage;