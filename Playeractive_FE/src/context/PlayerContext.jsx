import { createContext, useEffect, useRef, useState } from "react";
import { songsData } from "../assets/assets";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const updateUserState = (email) => {
    if (email) {
      setUser(email);
    } else {
      console.error("Failed to update user state: invalid email.");
    }
  };

  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const [track, setTrack] = useState({
    song_id: null,
    song_name: "",
    song_artist: "",
    preview_url: "",
    song_image: "",
  });

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
    if (audioRef.current) {
      audioRef.current.play();
      setPlayStatus(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayStatus(false);
    }
  };

  const playWithTrack = async (newTrack) => {
    // Kiểm tra xem bài hát có preview_url không
    if (!newTrack.preview_url) {
      // Nếu không có preview_url, giữ lại thông tin của bài hát cũ và không thay đổi thời gian, trạng thái phát
      setTrack(track); // Giữ bài hát hiện tại
      setPlayStatus(playStatus); // Giữ trạng thái play/pause
      setTime({
        currentTime: {
          second: Math.floor(audioRef.current.currentTime % 60),
          minute: Math.floor(audioRef.current.currentTime / 60),
        },
        totalTime: {
          second: Math.floor(audioRef.current.duration % 60),
          minute: Math.floor(audioRef.current.duration / 60),
        },
      }); // Giữ lại thời gian hiện tại
      if (seekBar.current) seekBar.current.style.width = `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`;
  
      alert("Bài hát này không có bản xem trước (preview)!");
      return; // Dừng mọi hành động khác
    }
  
    // Nếu bài hát có preview_url, cập nhật lại track và play
    if (track.preview_url !== newTrack.preview_url) {
      setTrack(newTrack); // Cập nhật track với bài hát mới
      audioRef.current.src = newTrack.preview_url;
      await audioRef.current.play();
      setPlayStatus(true); // Đặt trạng thái phát
    } else {
      // Nếu bài hát B đang phát và không có sự thay đổi về track, tiếp tục phát bài hát B
      if (playStatus && audioRef.current.paused) {
        await audioRef.current.play();
        setPlayStatus(true); // Tiếp tục phát bài hát B nếu nó đang ở trạng thái paused
      }
    }
  };
  
  
  

  const seekSong = (e) => {
    if (audioRef.current) {
      const newTime =
        (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
        audioRef.current.duration;
      audioRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration || 0;

        seekBar.current.style.width =
          Math.floor((currentTime / duration) * 100) + "%";

        setTime({
          currentTime: {
            second: Math.floor(currentTime % 60),
            minute: Math.floor(currentTime / 60),
          },
          totalTime: {
            second: Math.floor(duration % 60),
            minute: Math.floor(duration / 60),
          },
        });
      }
    };

    if (audioRef.current) {
      audioRef.current.ontimeupdate = updateTime;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.ontimeupdate = null;
      }
    };
  }, []);

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
    play,
    pause,
    playWithTrack,
    seekSong,
    user,
    updateUserState,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
