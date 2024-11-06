import React from 'react'
import Navbar from './Navbar'
import { albumsData } from '../assets/assets'
import AlbumItem from './AlbumItem'
import { songsData } from '../assets/assets'
import SongItem from './SongItem'

const DisplayHome = () => {
  return (
    <>
        <Navbar/>
        <div className='mb-4'>
          <h1 className='my-5 font-bold text-2xl'>Feature Charts</h1>
          <div className='flex overflow-auto'>
            {albumsData.map((item,index)=>(<AlbumItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image}/>))}
          </div>
        </div>

        <div className='mb-4'>
          <h1 className='my-5 font-bold text-2xl'>Today biggest hit</h1>
          <div className='flex overflow-auto'>
             {songsData.map((item,index)=>(<SongItem key={index} song_name1={item.song_name1} song_artist1={item.song_artist1}  song_image1={item.song_image1} song_id1={item.song_id1}/>))}
             
          </div>
        </div>
    </>
  )
}

export default DisplayHome