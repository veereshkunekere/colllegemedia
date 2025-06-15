import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';

function Profile() {

    const [avatar,setAvatar] = useState(null);

    useEffect(()=>{},[avatar])

    const submit=async (e)=>{
        e.preventDefault();
        const username = e.target.username.value;
        const image = e.target.image.files[0];
        const bio=e.target.bio.value;
        const link=e.target.links.value;
        const formData = new FormData();
        formData.append('username', username);
        formData.append("bio",bio);
        formData.append("link",link);
        if (image) {
            formData.append('image', image);
        }

       const response=await axios.put('http://localhost:3000/profile/edit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true // Include cookies in the request
            })
       
        console.log("Response", response);
        console.log("Data", response.data?.user?.profilePicture);
        if(response.status === 200) {
           setAvatar(response.data?.user?.profilePicture); // Assuming the response contains the updated avatar URL
            alert('Profile updated successfully');
        }

    }
    return ( 

        <>
        <h1>Notes upload</h1>

        <form className="profile-form" encType='multipart/form-data' onSubmit={submit}>
        <img  src={avatar}></img>
            <h2>Profile</h2>
            <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" required />
            </div>
            <div>
                <label name="image">Profile Picture:</label>
                <input type="file" id="image" name="image" accept="image/*" />  
            </div>
            <div>
                <label name="bio">Bio:</label>
                <textarea name='bio'></textarea>
            </div>
            <div>
                <label name='links' htmlFor='links'>Links</label>
                <input name='links' type='text'></input>
            </div>
           <button type="submit">Update Profile</button>
          </form>  



        </>
     );
}

export default Profile;