import React, { useContext,useState } from 'react'

import { BrowserRouter as Router, Route, Routes,useNavigate } from 'react-router-dom'

import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Callback from './pages/Callback/Callbak'

const App = () => {
  return (
    <div >
        <Routes>
          <Route path='*' element ={<Home/>}/>
          <Route path='/login' element ={<Login/>}/>
          <Route path='/callback' element={<Callback />} />
        </Routes>     
    </div>
    
  )
}

export default App