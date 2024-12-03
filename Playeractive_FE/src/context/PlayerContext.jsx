import { createContext, useEffect, useRef, useState } from "react";
import { useAuthContext } from './AuthContext';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const { spotifyToken } = useAuthContext();
  const [deviceId, setDeviceId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const updateUserState = (email) => {
    if (email) {
      setUser(email);
    } else {
      console.error("Failed to update user state: invalid email.");
    }
  };

  useEffect(() => {
    if (!spotifyToken) return;

    const initializePlayer = async () => {
      try {
        setIsInitializing(true);

        // Tạo và khởi tạo player
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(spotifyToken); },
          volume: 0.5
        });

        // Xử lý các sự kiện
        spotifyPlayer.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setIsReady(true);
          setIsInitializing(false);
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
          setIsReady(false);
        });

        // Xử lý lỗi
        spotifyPlayer.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize', message);
          setIsInitializing(false);
        });

        spotifyPlayer.addListener('authentication_error', ({ message }) => {
          console.error('Failed to authenticate', message);
          setIsInitializing(false);
        });

        spotifyPlayer.addListener('account_error', ({ message }) => {
          console.error('Failed to validate Spotify account', message);
          setIsInitializing(false);
        });

        // Kết nối player
        const connected = await spotifyPlayer.connect();
        
        if (connected) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
          setPlayer(spotifyPlayer);
          
          // Đặt thiết bị này làm thiết bị active
          await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${spotifyToken}`
            },
            body: JSON.stringify({
              device_ids: [deviceId],
              play: false
            })
          });
        }
      } catch (error) {
        console.error('Error initializing player:', error);
        setIsInitializing(false);
      }
    };

    // Đợi SDK load xong
    if (window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [spotifyToken]);

  const playFullTrack = async (trackUri) => {
    if (isInitializing) {
      alert("Spotify Player đang khởi tạo, vui lòng đợi trong giây lát...");
      return;
    }

    if (!deviceId || !isReady) {
      alert("Spotify Player chưa sẵn sàng. Vui lòng thử lại sau!");
      return;
    }

    try {
      // Đặt thiết bị này làm thiết bị active trước khi phát
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${spotifyToken}`
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });

      // Phát nhạc
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [trackUri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${spotifyToken}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      if (error.message.includes('Premium')) {
        alert("Bạn cần tài khoản Spotify Premium để sử dụng tính năng này!");
      } else {
        alert("Không thể phát bài hát. Vui lòng thử lại sau!");
      }
    }
  };

  const contextValue = {
    user,
    updateUserState,
  };

  return (
    <PlayerContext.Provider value={{
      contextValue,
      playFullTrack,
      player,
      deviceId,
      isReady,
      isInitializing,
      // ... other values
    }}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
