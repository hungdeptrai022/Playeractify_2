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
             {songsData.map((item,index)=>(<SongItem key={index} song_name={item.song_name} song_artist={item.song_artist}  song_image={item.song_image} song_id={item.song_id}/>))}
             
          </div>
        </div>
    </>
  )
}

export default DisplayHome