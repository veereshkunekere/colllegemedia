import axios from "axios";
import { useState } from "react";

function Tweet() {
    const [isAnonymus,setIsAnonyus]=useState(false);
    const submitTweet = async (e) => {
        e.preventDefault();
        console.log(e.target.content.value)
        const content=e.target.content.value;
        console.log(e.target.file.files[0])
        const image=e.target.file.files[0];
        console.log(image)
        const formData=new FormData();
        formData.append("content",content);
        formData.append("image",image);
        formData.append("isAnonymus",isAnonymus);
        
        try {
            const response=await axios.post("http://localhost:3000/tweet",formData,{
                withCredentials:true,
                headers:{
                    "Content-Type": "multipart/form-data"
                }
            })
            console.log(response)
        } catch (error) {
            console.log("error in submittion of tweet",error)
        }
        console.log("Tweet submitted");
    };
    const toggle=(e)=>{
        e.preventDefault();
        setIsAnonyus(!isAnonymus);
    }
    return ( <>
         <div className="tweet">
            <form className="tweet-form" onSubmit={submitTweet}>
                <button onClick={toggle}>{isAnonymus?"Anonymus":"Public"}</button>
                <textarea placeholder="What's happening?" className="tweet-input" name="content" rows="3" maxLength={280}></textarea>
                <input type="file" accept="image/*" name='file' className="tweet-image-input" />
                {<p>tweet wiil be {isAnonymus?"anonymus":"public"}</p>}
                <button type="submit" className="tweet-submit-button">Tweet</button>
            </form>
         </div>
    </> );
}

export default Tweet;