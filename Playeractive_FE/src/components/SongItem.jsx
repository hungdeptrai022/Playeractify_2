import React, { useContext } from 'react'
import { PlayerContext } from '../context/PlayerContext'

const SongItem = ({song_name,song_image,song_artist,song_id}) => {

  const {playwithId} = useContext(PlayerContext);

  return (
    <div onClick={()=>playwithId(song_id)} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
        <img className='rounded' src={song_image} alt="" />
        <p className='font-bold mt-2 mb-1'>{song_name}</p>
        <p className='text-slate-200 text-sm'>{song_artist}</p>
    </div>
  )
}

export default SongItem