import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { CookiesProvider } from 'react-cookie'
import { useEffect,useState } from 'react'
import './App.css'
import AuthWrapper from './util/AuthWrapper'
import Login from './pages/login'
import Upload from './pages/upload'
import ResetPasswordPage from './pages/resetPage'
import Signup from './pages/Register'
import Home from './pages/home'
import TweetFeed from './pages/TweetFeed'
import Tweet from './pages/Tweet'
import VerifyEmail from './pages/VerifyEmaail'
import ProfileEdit from './pages/profileEdit'
import Profile from './pages/Profile'
import Chats from './pages/Chats'
import Chatpage from './pages/Chatpage'
import { useAuthStore } from './store/useAuthStore'
import HomeFilledIcon from '@mui/icons-material/Home';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { Link, Outlet } from 'react-router-dom';
import VideoMeetComponet from './pages/VideoMeetComponet'
import IncomingCallModal from './pages/IncomingCallModal'

function Layout() {
    return (
        <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
            {/* Topbar */}
            <header className="sticky top-0 z-10 flex items-center justify-center px-4 py-2 bg-black border-b border-gray-800">
                <div className="flex items-center gap-2 w-full max-w-md">
                    <div className="flex items-center gap-2 flex-1 bg-gray-900 rounded-full px-3 py-2">
                        <SearchIcon className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-transparent outline-none text-white placeholder-gray-500 w-full text-sm"
                        />
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <nav className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 p-2 space-y-0.5">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition">
                        <HomeFilledIcon className="w-8 h-8 text-blue-500" />
                        <span className="text-xl font-bold hidden lg:block">X</span>
                    </Link>

                    {/* Navigation Items */}
                    <Link to="/home" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300">
                        <HomeFilledIcon className="w-6 h-6" />
                        <span className="hidden lg:block">Home</span>
                    </Link>

                    <Link to="/explore" className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-800 transition text-gray-300">
                        <SearchIcon className="w-6 h-6" />
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

                    {/* Tweet Button */}
                    <Link
                        to="/tweet"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition mb-2"
                    >
                        Tweet
                    </Link>

                     <Link
                        to="/upload"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-full transition mb-2"
                    >
                        Upload
                    </Link>


                    {/* User Menu */}
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

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                    <Outlet />
                </main>
            </div>

            {/* Custom Scrollbar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1f1f1f; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
            `}</style>
        </div>
    );
}

function App() {
  const {authuser,connectSocket, socket,checkAuth }=useAuthStore();
  const [incomingCall, setIncomingCall] = useState(null);  // { fromId, fromUsername, offer }

  useEffect(() => {
    if (!socket) return;

    const handleVideoCallOffer = (data) => {
      const { from, offer } = data;
      // Fetch username via API if needed, or from contacts
      // For now, assume you query or store
      setIncomingCall({ fromId: from, fromUsername: 'User', offer });
    };

    socket.on('video-call-offer', handleVideoCallOffer);

    return () => socket.off('video-call-offer', handleVideoCallOffer);
  }, [socket]);

  const declineCall = () => {
    console.log(" call from", incomingCall.fromId);
    socket.emit('call-declined', { to: incomingCall.fromId });
    setIncomingCall(null);
}

const answerCall=()=>{
    setIncomingCall(null)
}
 
   useEffect(() => {
    checkAuth(); // <-- Check session on app load
  }, [checkAuth]);

  return(
    <CookiesProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login></Login>}></Route>
          <Route path='/reset-password/:token' element={<ResetPasswordPage></ResetPasswordPage>}></Route>
          <Route path='/verify-email' element={<VerifyEmail></VerifyEmail>}></Route>
          <Route path='/register/:token' element={<Signup></Signup>}></Route>   
          <Route element={<AuthWrapper />}>
            <Route element={<Layout />}>
                <Route path='/home' element={<Home />}></Route>            
                <Route path='/profile' element={<Profile />}></Route>
                <Route path='/profile/edit' element={<ProfileEdit />}></Route>
                <Route path='/upload' element={<Upload />} />
                <Route path='/tweetfeed' element={<TweetFeed />}></Route>
                <Route path='/tweet' element={<Tweet />}></Route>
                <Route path='/chats' element={<Chats />}></Route>  
                <Route path='/chats/:id' element={<Chatpage />}></Route>
            </Route>
            <Route path='/call/:id' element={<VideoMeetComponet></VideoMeetComponet>}></Route>
          </Route>
        </Routes>
        <IncomingCallModal
        show={!!incomingCall}
        fromUserId={incomingCall?.fromId}
        fromUsername={incomingCall?.fromUsername}
        offer={incomingCall?.offer}
        onDecline={declineCall}
        onAnswer={answerCall}
     >
     </IncomingCallModal>
     </BrowserRouter>
   </CookiesProvider>  
  )
}

export default App