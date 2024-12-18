import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";
import { useAlbumColor } from '../hooks/useAlbumColor'
import { useAuthContext } from '../context/AuthContext'

const SongsByAlbum = () => {
  const { albumId } = useParams();
  const [songs, setSongs] = useState([]);
  const [albumInfo, setAlbumInfo] = useState(null);
  const { playFullTrack, isReady } = useContext(PlayerContext);
  const { spotifyToken } = useAuthContext();
  const { colors, loading } = useAlbumColor(albumInfo?.images?.[0]?.url);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!spotifyToken || !albumId) return;

    const fetchAlbumData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const albumResponse = await fetch(
          `https://api.spotify.com/v1/albums/${albumId}`,
          {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
            },
          }
        );

        if (!albumResponse.ok) {
          throw new Error('Failed to fetch album info');
        }

        const albumData = await albumResponse.json();
        setAlbumInfo(albumData);

        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/albums/${albumId}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${spotifyToken}`,
            },
          }
        );

        if (!tracksResponse.ok) {
          throw new Error('Failed to fetch album tracks');
        }

        const tracksData = await tracksResponse.json();
        setSongs(tracksData.items || []);

      } catch (error) {
        console.error("Error fetching album data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbumData();
  }, [albumId, spotifyToken]);

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayTrack = async (track, index) => {
    try {
      // Tạo danh sách URI của tất cả các bài hát trong album
      const albumTracks = songs.map(song => `spotify:track:${song.id}`);

      // Phát bài hát được chọn và queue các bài còn lại
      await playFullTrack(albumTracks, index);
    } catch (error) {
      console.error("Error playing track:", error);
      alert("Không thể phát bài hát này. Vui lòng đảm bảo bạn có tài khoản Spotify Premium!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p>Loading album...</p>
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
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.3)'
        }}
      />

      <div className="relative z-10">
        <Navbar />
        <div className="mt-1 flex gap-8 flex-col md:flex-row md:items-end">
          {albumInfo?.images?.[0]?.url && (
            <img
              className="ml-5 w-48 h-48 rounded shadow-xl"
              src={albumInfo.images[0].url}
              alt={albumInfo.name}
            />
          )}
          <div className="flex flex-col">
            <p className="text-white opacity-80">Album</p>
            <h2 className="text-5xl font-bold mb-4 md:text-7xl text-white">
              {albumInfo?.name}
            </h2>
            <div className="flex items-center gap-2 text-white opacity-80">
              <h4>
                {albumInfo?.artists?.map(artist => (
                  <span
                    key={artist.id}
                    className="cursor-pointer hover:underline"
                    onClick={() => navigate(`/search/songs-by-artist/${artist.id}`)}
                  >
                    {artist.name}
                  </span>
                )).reduce((prev, curr) => [prev, ', ', curr])}
              </h4>
              <span>•</span>
              <p>{songs.length} Songs</p>
              <span>•</span>
              <p>Release Date: {albumInfo?.release_date}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 px-4">
          <div className="grid grid-cols-[60px_1fr_120px_80px] py-4 px-2 text-[#a7a7a7] border-b border-[#ffffff1a]">
            <p className="text-left">#</p>
            <p className="text-left">Title</p>
            <p className="hidden sm:block text-left">Date Released</p>
            <p className="text-left">Duration</p>
          </div>

          {songs.map((track, index) => (
            <div
              key={track.id}
              onClick={() => handlePlayTrack(track, index)}
              className="grid grid-cols-[60px_1fr_120px_80px] p-2 items-center 
                          text-[#a7a7a7] hover:bg-[#ffffff26] cursor-pointer 
                          transition-colors duration-200 select-none"
              tabIndex="-1"
            >
              <span className="text-left">{index + 1}</span>
              <div className="flex items-center gap-4 text-white min-w-0">
                <img
                  className="w-10 h-10 flex-shrink-0"
                  src={albumInfo?.images?.[0]?.url || "https://via.placeholder.com/150"}
                  alt=""
                />
                <span className="truncate">{track.name}</span>
              </div>
              <p className="text-[15px] hidden sm:block text-left">{albumInfo?.release_date}</p>
              <p className="text-[15px] text-left">{formatDuration(track.duration_ms)}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SongsByAlbum;
