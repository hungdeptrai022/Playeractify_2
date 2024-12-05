import React, { useState, useEffect, useContext } from "react";
import { useParams,useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";
import { useAlbumColor } from '../hooks/useAlbumColor';
import { useAuthContext } from '../context/AuthContext';

const SongsByArtist = () => {
  const { artistId } = useParams();
  const [songs, setSongs] = useState([]);
  const [artistInfo, setArtistInfo] = useState(null);
  const { colors, loading } = useAlbumColor(artistInfo?.images?.[0]?.url);
  const { spotifyToken } = useAuthContext();
  const { playFullTrack, isReady, currentTrackUri } = useContext(PlayerContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!spotifyToken || !artistId) return;

    const fetchArtistData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const artistResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}`,
          {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
            },
          }
        );

        if (!artistResponse.ok) {
          throw new Error('Failed to fetch artist info');
        }

        const artistData = await artistResponse.json();
        setArtistInfo(artistData);

        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=VN`,
          {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
            },
          }
        );

        if (!tracksResponse.ok) {
          throw new Error('Failed to fetch top tracks');
        }

        const tracksData = await tracksResponse.json();
        setSongs(tracksData.tracks || []);

      } catch (error) {
        console.error("Error fetching artist data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId, spotifyToken]);
  const handleAlbumClick = (albumId) => {
    navigate(`/search/songs-by-album/${albumId}`); // Điều hướng đến trang SongsByAlbum
  };


  const handlePlayTrack = async (track, index) => {
    try {
      // Tạo danh sách URI của tất cả các bài hát của artist
      const artistTracks = songs.map(song => `spotify:track:${song.id}`);
      
      // Phát bài hát được chọn và queue các bài còn lại
      await playFullTrack(artistTracks, index);
    } catch (error) {
      console.error("Error playing track:", error);
      alert("Không thể phát bài hát này. Vui lòng đảm bảo bạn có tài khoản Spotify Premium!");
    }
  };

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p>Loading artist data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        background: loading 
          ? 'rgb(18, 18, 18)' 
          : `linear-gradient(180deg, 
              ${colors?.dominant || 'rgb(18, 18, 18)'} 0%, 
              ${colors?.darkMuted || 'rgb(18, 18, 18)'} 100%)`
      }}
      className="min-h-screen relative"
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.3)' }} />

      <div className="relative z-10">
        <Navbar />
          <div className="mt-1 flex gap-8 flex-col md:flex-row md:items-end">
            <img 
              className="ml-5 w-48 h-48 rounded-full shadow-xl object-cover" 
              src={artistInfo?.images[0]?.url} 
              alt={artistInfo?.name} 
            />
            <div className="flex flex-col">
              <span className="text-white opacity-80">Artist</span>
              <h2 className="text-5xl font-bold mb-4 md:text-7xl text-white">
                {artistInfo?.name}
              </h2>
              <div className="flex items-center gap-2 text-white opacity-80">
                <span>{artistInfo?.followers?.total?.toLocaleString()} followers</span>
                <span>•</span>
                <span>{songs.length} Popular Tracks</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 py-4 px-2 text-[#a7a7a7] border-b border-[#ffffff1a]">
              <p><b className="mr-4">#</b>Title</p>
              <p>Album</p>
              <p className="hidden sm:block">Date Released</p>
              <p>Duration</p>
            </div>

            {songs.map((track, index) => (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track, index)}
                className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center 
                         text-[#a7a7a7] hover:bg-[#ffffff1a] cursor-pointer 
                         transition-colors duration-200"
              >
                <div className="flex items-center text-white">
                  <span className="w-8 text-[#a7a7a7]">{index + 1}</span>
                  <img
                    className="w-10 h-10 mr-4 rounded"
                    src={track.album?.images?.[0]?.url}
                    alt=""
                  />
                  <span className="truncate">{track.name}</span>
                </div>
                <p className="text-[15px] truncate hover:underline" onClick={(e) => { e.stopPropagation(); handleAlbumClick(track.album.id); }}>{track.album.name}</p>
                <p className="text-[15px] hidden sm:block">{track.album.release_date}</p>
                <p className="text-[15px]">{formatDuration(track.duration_ms)}</p>
              </div>
            ))}
          </div>
        
      </div>
    </div>
  );
};

export default SongsByArtist;
