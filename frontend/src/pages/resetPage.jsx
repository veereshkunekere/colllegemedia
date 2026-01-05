import api from "../util/api";
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
           const response=await api.post(`/auth/reset-password/${token}`,{newPassword:newPassword})
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
       <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
    <h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Reset Password</h1>
    <p className="text-sm text-gray-600 mb-6 text-center">Please enter your new password below.</p>
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          id="new-password"
          name="new-password"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm-password"
          name="confirm-password"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Reset Password
      </button>
    </form>
  </div>
</div>

     );
}

export default ResetPasswordPage;