import { createContext, useEffect, useRef, useState } from "react";
import { songsData } from "../assets/assets";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const [track, setTrack] = useState({
    song_id: null,
    song_name: '',
    song_artist: '',
    preview_url: '',
    song_image :'',
  });
 
  const [track1, setTrack1] = useState(songsData[3]);

  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: {
      second: 0,
      minute: 0,
    },
    totalTime: {
      second: 0,
      minute: 0,
    },
  });
  
  const play = () => {
    audioRef.current.play();
    setPlayStatus(true)
  }

  const pause = () => {
    audioRef.current.pause();
    setPlayStatus(false);
  }

const playwithId =  async (id) => {
    setTrack1 (songsData[id]);
    audioRef.current.src = track1.file;
    audioRef.current.play();
    setPlayStatus(true);

}
const playWithTrack = async (track) => {
  setTrack(track);
  audioRef.current.src = track.preview_url; // Cập nhật src của audio với preview_url
  audioRef.current.play();
  setPlayStatus(true);
}



const previous = async () => {
    if(track1.song_id>0){
        await setTrack(songsData[track1.song_id-1]);
        await audioRef.current.play();
        setPlayStatus(true);
    }
}

const next = async () => {
    if(track1.song_id<songsData.length - 1){
        await setTrack(songsData[track1.song_id+1]);
        await audioRef.current.play();
        setPlayStatus(true);
    }
}

const seekSong = async (e) => {
    audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth)*audioRef.current.duration)
}



useEffect(()=>{
  setTimeout(() => {
      audioRef.current.ontimeupdate = () => {
          seekBar.current.style.width = (Math.floor(audioRef.current.currentTime/audioRef.current.duration*100))+"%";
          setTime({
              currentTime: {
                second: Math.floor(audioRef.current.currentTime % 60),
                minute: Math.floor(audioRef.current.currentTime / 60),
              },
              totalTime: {
                  second: Math.floor(audioRef.current.duration % 60),
                  minute: Math.floor(audioRef.current.duration / 60),
              } 
            })
      }
  },1000);
}, [audioRef])

  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track,
    setTrack,
    playStatus,
    setPlayStatus,
    time,
    setTime,
    play,pause,
    playwithId,
    previous,next,
    seekSong,
    playWithTrack,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
      <audio ref={audioRef}/>
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
