import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const SongItem = ({song_name1,song_image1,song_artist1,song_id1}) => {

  const {playwithId} = useContext(PlayerContext);

  return (
    <div onClick={()=>playwithId(song_id1)} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
        <img className='rounded' src={song_image1} alt="" />
        <p className='font-bold mt-2 mb-1'>{song_name1}</p>
        <p className='text-slate-200 text-sm'>{song_artist1}</p>
    </div>
  )
}

export default SongItem