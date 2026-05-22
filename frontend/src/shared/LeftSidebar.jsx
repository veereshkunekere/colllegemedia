// New LeftSidebar.jsx (X-like vertical navigation)
import HomeFilledIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';

function LeftSidebar() {
    return (
        <nav className="flex flex-col space-y-2">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition">
                <HomeFilledIcon className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold hidden lg:block">X</span>
            </Link>

            {/* Navigation Items */}
            <Link to="/" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300">
                <HomeFilledIcon className="w-6 h-6" />
                <span className="hidden lg:block">Home</span>
            </Link>

            <Link to="/explore" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300">
                <SearchIcon className="w-6 h-6" /> {/* Assuming Search for Explore */}
                <span className="hidden lg:block">Explore</span>
            </Link>

            <Link to="/notifications" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300">
                <NotificationsIcon className="w-6 h-6" />
                <span className="hidden lg:block">Notifications</span>
            </Link>

            <Link to="/chats" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300">
                <ChatBubbleIcon className="w-6 h-6" />
                <span className="hidden lg:block">Messages</span>
            </Link>

            <Link to="/profile" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300">
                <PersonIcon className="w-6 h-6" />
                <span className="hidden lg:block">Profile</span>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Tweet Button (placeholder for Tweet.jsx integration) */}
            <Link
                to="/tweet"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition mb-2"
            >
                Tweet
            </Link>

            {/* More / User Menu */}
            <div className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300 cursor-pointer">
                <PersonIcon className="w-6 h-6" />
                <div className="hidden lg:block">
                    <p className="font-bold">Profile</p>
                    <p className="text-sm text-gray-500">@username</p>
                </div>
                <div className="ml-auto">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </nav>
    );
}

export default LeftSidebar;