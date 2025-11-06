import SearchIcon from '@mui/icons-material/Search';
import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom'
function Navbar() {
    const [search,setSearch]=useState("");
    const navigate=useNavigate();
    return(
        <div className="relative flex items-center justify-between px-4 py-3 bg-gray-100 w-full">
  <div className="flex items-center gap-2 max-w-[50%] ml-4">
    <input
      type="text"
      placeholder="Search"
      className="px-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none text-sm sm:text-base"
    />
    <button className="p-2 rounded-full border border-gray-300">
      <SearchIcon className="w-5 h-5 text-gray-600" />
    </button>
  </div>

  <div className="absolute left-1/2 -translate-x-1/2 flex gap-6 items-center">
    <HomeFilledIcon className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
    <Link to={'/chats'}>
        <ChatBubbleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
    </Link>
    <NotificationsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
    <Link className='' to={'/profile'}>
        <PersonIcon className='w-8 h-8 sm:w-8 sm:h-8 text-blue-500' ></PersonIcon>
    </Link>
  </div>

  <div className="ml-auto mr-6">
    <button className="px-3 py-2 rounded border border-gray-300 text-sm sm:text-base">
      
    </button>
  </div>
</div>

    )
    // return ( 
    //     <div className="flex justify-between p-6 px-4 py-4 items-center w-full">
    //         <div className="p-4  flex items-center gap-4">
    //             <img src=""></img>
    //             <form className='mx-40px'>
    //                 <input
    //                 type="text"
    //                 name="search"
    //                 placeholder="search"
    //                 className='bg-white color-black h-full border border-grey-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300'
    //                 />
    //                 <button className='p-2 rounded-full '><SearchIcon className='w-10 h-10 text-pink-700'></SearchIcon></button>
    //             </form>
    //         </div>
    //         <div className='flex gap-6 items-center justify-center'>
    //             <i className='text-red-500 '><HomeFilledIcon className='w-12 h-12'></HomeFilledIcon></i>
    //             <i><ChatBubbleIcon></ChatBubbleIcon></i>
    //             <i><NotificationsIcon></NotificationsIcon></i>
    //         </div>
    //         <div className='px-3 py-2 rounded border border-gray-300'>
    //             <select>
    //                 <option>ELement</option>
    //             </select>
    //         </div>
    //     </div>
    //  );
}

export default Navbar;