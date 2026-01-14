import api from "../util/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
function Profile() {
    const [user, setUser] = useState(null);
    const [showPost, setShowPost] = useState(false);
    const [showTweets, setShowTweets] = useState(true);
    const [showUploads, setShowUploads] = useState(false);

    const getProfile = async () => {
        try {
            const response = await api.get("/user/profile");
            if (response.status === 200 && response.data?.data) {
                console.log(response.data.data);
                setUser(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const toggle = (n) => {
        if (n === 1) {
            console.log("posts");
            setShowPost(true);
            setShowTweets(false);
            setShowUploads(false);
        } else if (n === 2) {
            console.log("tweets");
            setShowPost(false);
            setShowTweets(true);
            setShowUploads(false);
        } else if (n === 3) {
            console.log("uploads");
            setShowPost(false);
            setShowTweets(false);
            setShowUploads(true);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4">
            {/* Profile Header */}
            <div className="max-w-6xl mx-auto">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6 flex flex-col md:flex-row items-center justify-center gap-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-800 overflow-hidden">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user?.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center text-gray-300 font-bold text-2xl">
                                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info & Stats */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {user?.username || "Loading..."}
                        </h1>
                        <p className="text-gray-500 mb-2">@{user?.username?.toLowerCase() || 'user'}</p>
                        {user?.bio && (
                            <p className="text-gray-300 mb-4">{user.bio}</p>
                        )}
                        <div className="flex justify-center md:justify-start gap-8 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">12</div>
                                <div className="text-sm text-gray-500">Posts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">456</div>
                                <div className="text-sm text-gray-500">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">789</div>
                                <div className="text-sm text-gray-500">Following</div>
                            </div>
                        </div>
                        <Link
                        to="/profile/edit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition mb-2"
                        >
                          Edit Profile
                        </Link>        
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
                    <div className="flex border-b border-gray-800">
                        <button
                            onClick={() => toggle(1)}
                            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                                showPost
                                    ? "text-blue-400 border-b-2 border-blue-400"
                                    : "text-gray-400 hover:text-gray-200"
                            }`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => toggle(2)}
                            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                                showTweets
                                    ? "text-blue-400 border-b-2 border-blue-400"
                                    : "text-gray-400 hover:text-gray-200"
                            }`}
                        >
                            Tweets
                        </button>
                        <button
                            onClick={() => toggle(3)}
                            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                                showUploads
                                    ? "text-blue-400 border-b-2 border-blue-400"
                                    : "text-gray-400 hover:text-gray-200"
                            }`}
                        >
                            Uploads
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 min-h-[400px]">
                        {showPost && (
                            <div className="flex items-center justify-center text-gray-400">
                                <div>
                                    <h2 className="text-2xl font-semibold">Posts</h2>
                                    <p className="text-sm mt-2">Content will appear here.</p>
                                </div>
                            </div>
                        )}
                        {showTweets && (
                            <div className="flex items-center justify-center text-gray-400">
                                <div>
                                    <h2 className="text-2xl font-semibold">Tweets</h2>
                                    <p className="text-sm mt-2">Content will appear here.</p>
                                </div>
                            </div>
                        )}
                        {showUploads && (
                            <div className="space-y-6">
                                {Object.entries(user?.uploads || {}).map(([category, items]) =>
                                    items.length > 0 ? (
                                        <div key={category} className="bg-gray-800 rounded-xl p-4">
                                            <h3 className="text-xl font-semibold capitalize mb-3">
                                                {category} ({items.length})
                                            </h3>
                                            <ul className="space-y-2">
                                                {items.map((id, index) => (
                                                    <li key={`${category}-${index}`} className="text-gray-300">
                                                        <a
                                                            href={`/uploads/${category}/${id}`}
                                                            className="hover:text-blue-400 transition-colors"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {category} Upload {index + 1}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null
                                )}
                                {Object.values(user?.uploads || {}).every((arr) => arr.length === 0) && (
                                    <div className="flex items-center justify-center text-gray-400">
                                        <div>
                                            <h2 className="text-2xl font-semibold">Uploads</h2>
                                            <p className="text-sm mt-2">No uploads yet.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;