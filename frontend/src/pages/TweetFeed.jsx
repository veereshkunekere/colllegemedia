// Updated TweetFeed.jsx (X-like Tweet Cards)
import axios from "axios";
import { useEffect, useState } from "react";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import VisibilityIcon from '@mui/icons-material/Visibility';

function TweetFeed() {
    const [tweets, setTweets] = useState([]);
    const [currussr, setCurrussr] = useState("");

    useEffect(() => {
        getTweets();
    }, []);

    const getTweets = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/tweet/tweetfeed", {
                withCredentials: true
            });
            console.log("called");
            console.log(response.data.data);
            console.log(response.data.user);
            setTweets(response.data.data);
            setCurrussr(response.data.user._id);
        } catch (e) {
            console.log(e);
        }
    };

    const like = async (id) => {
        console.log("clicked");
        try {
            setTweets((prevTweets) => prevTweets.map((tweet) => {
                if (tweet._id === id) {
                    const isLiked = tweet.likes.includes(currussr);
                    return {
                        ...tweet,
                        likes: isLiked ? tweet.likes.filter((user) => user != currussr) : [...tweet.likes, currussr]
                    };
                }
                return tweet;
            }));
        } catch (error) {
            console.log("error", error);
        }
        try {
            const response = await axios.post("http://localhost:3000/tweetlike", { id: id }, {
                withCredentials: true
            });
            if (response.status === 200) {
                console.log("like updated");
            }
        } catch (error) {}
    };

    const Report = async (id) => {
        try {
            const response = await axios.post("http://localhost:3000/reportTweet", { id: id, userId: currussr }, {
                withCredentials: true
            });
            if (response.status === 200) {
                console.log("reported", response.data.message);
            }
        } catch (error) {}
    };

    return (
        <div className="space-y-4">
            {tweets.map((tweet) => {
                const isLike = tweet.likes.includes(currussr);
                return (
                    <article key={tweet._id} className="bg-gray-900 rounded-3xl border border-gray-800 hover:bg-gray-850 transition">
                        {/* Tweet Header */}
                        <div className="flex items-start p-4 border-b border-gray-800">
                            <img
                                src={`https://ui-avatars.com/api/?name=${tweet.username}`}
                                alt="avatar"
                                className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                        <strong className="text-white font-bold">{tweet.isAnonymous ? "anonymous" : tweet.username}</strong>
                                        <span className="text-gray-500 text-sm">@{tweet.username?.toLowerCase() || 'anon'}</span>
                                        <span className="text-gray-500 text-sm">·</span>
                                        <span className="text-gray-500 text-sm">{new Date(tweet.createdAt).toLocaleString()}</span>
                                    </div>
                                    <button onClick={() => Report(tweet._id)} className="text-gray-500 hover:text-red-500 p-1 rounded-full">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-2zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-2zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-2z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tweet Content */}
                        <div className="p-4">
                            <p className="text-white text-base leading-relaxed">{tweet.content}</p>
                            {tweet.imageUrl && (
                                <div className="mt-3">
                                    <img
                                        src={tweet.imageUrl}
                                        alt="tweet"
                                        className="w-full rounded-2xl max-h-96 object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Tweet Actions */}
                        <div className="flex items-center justify-between p-4 border-t border-gray-800">
                            <div className="flex items-center space-x-4 text-gray-500">
                                <button className="group flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition">
                                    <ChatBubbleOutlineIcon className="w-5 h-5 group-hover:text-blue-500" />
                                    <span className="text-sm">{tweet.comments?.length || 0}</span>
                                </button>
                                <button className="group flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition">
                                    <RepeatIcon className="w-5 h-5 group-hover:text-green-500" />
                                    <span className="text-sm">0</span>
                                </button>
                                <button
                                    onClick={() => like(tweet._id)}
                                    className="group flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition"
                                >
                                    {isLike ? <FavoriteIcon className="w-5 h-5 text-red-500" /> : <FavoriteBorderIcon className="w-5 h-5 group-hover:text-red-500" />}
                                    <span className="text-sm">{tweet.likes.length}</span>
                                </button>
                                <button className="group flex items-center space-x-2 p-2 rounded-full hover:bg-gray-800 transition">
                                    <VisibilityIcon className="w-5 h-5 group-hover:text-blue-500" />
                                    <span className="text-sm">1k</span>
                                </button>
                            </div>
                            <button className="text-gray-500 hover:text-blue-500 p-2 rounded-full">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a1 1 0 11-1.414 1.414l-7-7A1 1 0 007 3z" />
                                    <path d="M3 7v5c0 .512.195 1.024.586 1.414l7 7a1 1 0 001.414-1.414l-7-7A1.998 1.998 0 003 7z" />
                                </svg>
                            </button>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

export default TweetFeed;