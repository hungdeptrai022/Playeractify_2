import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";

const Player = () => {
  const {
    player,
    deviceId,
    isReady,
    spotifyToken
  } = useContext(PlayerContext);

  const [playerState, setPlayerState] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    if (!player) return;

    // Lắng nghe sự thay đổi trạng thái của player
    player.addListener('player_state_changed', state => {
      if (!state) return;

      setPlayerState(state);
      setIsPlaying(!state.paused);
      setCurrentTrack(state.track_window.current_track);
      setTrackProgress(state.position);
    });

    // Cập nhật progress bar
    const interval = setInterval(() => {
      player.getCurrentState().then(state => {
        if (state) {
          setTrackProgress(state.position);
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      player.removeListener('player_state_changed');
    };
  }, [player]);

  const handlePlayPause = () => {
    if (!player) return;

    player.togglePlay().then(() => {
      setIsPlaying(!isPlaying);
    });
  };

  const handlePrevious = () => {
    if (!player) return;
    player.previousTrack().then(() => {
      console.log("Playing previous track");
    });
  };

  const handleNext = () => {
    if (!player) return;
    player.nextTrack().then(() => {
      console.log("Playing next track");
    });
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e) => {
    if (!player || !playerState) return;
    
    const seekBar = e.currentTarget;
    const rect = seekBar.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const seekPosition = position * playerState.duration;
    
    player.seek(seekPosition);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
  };

  return (
    <div className="h-[10%] bg-black flex justify-between items-center text-white px-4">
      {/* Track Info */}
      <div className="hidden lg:flex items-center gap-4">
        <img 
          className="w-12" 
          src={currentTrack?.album.images[0]?.url} 
          alt="" 
        />
        <div>
          <h3 className="font-bold mt-2 mb-1 w-[250px] group overflow-hidden cursor-pointer whitespace-nowrap">
            <span className="block group-hover:animate-text-slide">
              {currentTrack?.name || "No song playing"}
            </span>
          </h3>
          <p className="text-slate-200 text-sm group overflow-hidden cursor-pointer w-[250px] whitespace-nowrap">
            <span className="block group-hover:animate-text-slide">
              {currentTrack?.artists.map(artist => artist.name).join(", ") || ""}
            </span>
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-1 m-auto">
        <div className="flex gap-4">
          <img
            className="w-4 cursor-pointer"
            src={assets.shuffle_icon}
            alt=""
          />
          <img
            onClick={handlePrevious}
            className="w-4 cursor-pointer"
            src={assets.prev_icon}
            alt=""
          />
          {isPlaying ? (
            <img
              onClick={handlePlayPause}
              className="w-4 cursor-pointer"
              src={assets.pause_icon}
              alt=""
            />
          ) : (
            <img
              onClick={handlePlayPause}
              className="w-4 cursor-pointer"
              src={assets.play_icon}
              alt=""
            />
          )}
          <img
            onClick={handleNext}
            className="w-4 cursor-pointer"
            src={assets.next_icon}
            alt=""
          />
          <img 
            className="w-4 cursor-pointer" 
            src={assets.loop_icon} 
            alt="" 
          />
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-5">
          <p>{formatTime(trackProgress)}</p>
          <div
            onClick={handleSeek}
            className="w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer"
          >
            <div
              className="h-1 bg-blue-800 rounded-full transition-all"
              style={{
                width: `${playerState ? (trackProgress / playerState.duration) * 100 : 0}%`
              }}
            />
          </div>
          <p>{playerState ? formatTime(playerState.duration) : '0:00'}</p>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="hidden lg:flex items-center gap-2 opacity-75">
       
        <img className="w-4" src={assets.plays_icon} alt="" />
        <img className="w-4" src={assets.mic_icon} alt="" />
        <img className="w-4" src={assets.queue_icon} alt="" />
        <img className="w-4" src={assets.speaker_icon} alt="" />
        <img className="w-4" src={assets.volume_icon} alt="" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20"
        />
        <img className="w-4" src={assets.mini_player_icon} alt="" />
        <img className="w-4" src={assets.zoom_icon} alt="" />
      </div>
    </div>
  );
};

export default Player;
