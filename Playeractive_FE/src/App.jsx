import React, { useContext,useState } from 'react'

import { BrowserRouter as Router, Route, Routes,useNavigate } from 'react-router-dom'

import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Callback from './pages/Callback/Callbak'
import { AuthProvider } from './context/AuthContext'
import Userprofile from './pages/Userprofile/Userprofile'

const App = () => {
  return (
    <AuthProvider>
        <Routes>
          <Route path='/' element ={<Home/>}/>
          <Route path='/login' element ={<Login/>}/>
          <Route path='/callback' element={<Callback />} />
          <Route path='/Userprofile' element={<Userprofile />} />
        </Routes>     
    </AuthProvider>
    
  )
}

export default App