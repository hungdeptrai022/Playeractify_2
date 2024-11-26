import React, { useContext,useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Player from '../../components/Player'
import Display from '../../components/Display'
import { PlayerContext } from '../../context/PlayerContext'
import { BrowserRouter as Router, Route, Routes,useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'


const Home = () => {
    const {audioRef,track} = useContext(PlayerContext) 
  return (
    <div className='h-screen bg-black'>
         <div className='h-[90%] flex'>
          <Sidebar/>
          <Display/>
      </div>
      
     
      <Player/>
    </div>
  )
}

export default Home