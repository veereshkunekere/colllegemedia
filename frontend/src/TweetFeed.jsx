import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
function TweetFeed() {
    const [tweets,setTweets]=useState([]);
    const [currussr,setCurrussr]=useState("");
    useEffect(()=>{
      getTweets();
    },[])

    const getTweets=async ()=>{
        try{
            const response=await axios.get("http://localhost:3000/tweetfeed",{
                withCredentials:true
            });
            console.log("called")
            console.log(response.data.data);
            console.log(response.data.user)
            setTweets(response.data.data);
           setCurrussr(response.data.user._id);
        }catch(e){console.log(e)}
    }

    const like=async (id)=>{
        console.log("clicked")
       try {
        setTweets((prevTweets)=>prevTweets.map((tweet)=>{
            if(tweet._id===id){
              const isLiked=tweet.likes.includes(currussr);
              return{
                ...tweet,
                likes:isLiked?tweet.likes.filter((user)=>user!=currussr):[...tweet.likes,currussr]
              }
            }
            return tweet
        }))
       } catch (error) {
        console.log("error",error)
       }
       try {
        const response=await axios.post("http://localhost:3000/tweetlike",{id:id},{
            withCredentials:true
        });
        if(response.status ===200){
            console.log("like updated")
        }
       } catch (error) {
        
       }
       

    }

    const Report=async (id)=>{
        try {
            const response=await axios.post("http://localhost:3000/reportTweet",{id:id,userId:currussr},{
                withCredentials:true
            });
            if(response.status===200){
                console.log("reported",response.data.message);
            }
        } catch (error) {
            
        }
    }
        return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
            {tweets.map((tweet) => {
                const isLike=tweet.likes.includes(currussr);
                return(
                    <div
                    key={tweet._id}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "1rem",
                        marginBottom: "1rem",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", color:"black" }}>
                        <img
                            src={`https://ui-avatars.com/api/?name=${tweet.username}`}
                            alt="avatar"
                            style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "0.75rem" }}
                        />
                        <strong>{tweet.isAnonymous?"anonymous":tweet.username}</strong>
                        <button onClick={()=>Report(tweet._id)}>Report</button>
                    </div>
                    <p style={{ marginBottom: "0.75rem", fontSize: "1rem", color:"black"}}>{tweet.content}</p>
                    {tweet.imageUrl && (
                        <img
                            src={tweet.imageUrl}
                            alt="tweet"
                            style={{ width: "100%", borderRadius: "10px", marginBottom: "0.75rem" }}
                        />
                    )}
                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.9rem", color: "#555" }}>
                        <div><button onClick={()=>like(tweet._id)} data-like='false'>{isLike?<FavoriteIcon></FavoriteIcon>:<FavoriteBorderIcon></FavoriteBorderIcon>}</button> {tweet.likes.length}</div>
                        <span>💬 {tweet.comments?.length || 0}</span>
                        <span style={{ marginLeft: "auto" }}>
                            {new Date(tweet.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>
                )
})}
        </div>
    );
}

export default TweetFeed;