import { useState } from 'react'
import { BrowserRouter as BroswerRouter } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/login'
import Profile from './pages/profileEdit'
import Upload from './pages/upload'
import ResetPasswordPage from './pages/resetPage'
import Signup from './pages/Register'
import Home from './pages/home'
import TweetFeed from './TweetFeed'
import Tweet from './pages/Tweet'
import VerifyEmail from './pages/VerifyEmaail'
function App() {
  return(
    <BroswerRouter>
    <Routes>
      <Route path='/home' element={<Home></Home>}></Route>
      <Route path='/login' element={<Login></Login>}></Route>
      <Route path='/profile/edit' element={<Profile></Profile>}></Route>
      
      <Route path='/upload' element={<Upload></Upload>}/>
      <Route path='/reset-password/:token' element={<ResetPasswordPage></ResetPasswordPage>}></Route>
      <Route path='/verify-email' element={<VerifyEmail></VerifyEmail>}></Route>
      <Route path='/register/:token' element={<Signup></Signup>}></Route>
      <Route path='/tweetfeed' element={<TweetFeed></TweetFeed>}></Route>
      <Route path='tweet' element={<Tweet></Tweet>}></Route>
    </Routes>
    </BroswerRouter>
  )
}

export default App
