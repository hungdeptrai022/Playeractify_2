import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";
import { useAlbumColor } from '../hooks/useAlbumColor'

const SongsByAlbum = () => {
  const { albumId } = useParams(); // Lấy albumId từ URL
  const [songs, setSongs] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const { playWithTrack } = useContext(PlayerContext);
  const [albumInfo, setAlbumInfo] = useState(null); 
  const { colors, loading } = useAlbumColor(albumInfo?.images?.[0]?.url);
  useEffect(() => {
    const fetchAccessToken = async () => {  
      const authParameters = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=1b512b5a45e84e56b21ebef0b920b693&client_secret=dc2567d10ddb4a31920f52af2c8b5bd9`,
      };

      try {
        const result = await fetch(
          "https://accounts.spotify.com/api/token",
          authParameters
        );
        const data = await result.json();
        setAccessToken(data.access_token);
      } catch (error) {
        console.error("Error fetching access token:", error);
      }
    };

    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const fetchSongs = async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/albums/${albumId}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setSongs(data.items || []);
      } catch (error) {
        console.error("Error fetching songs by album:", error);
      }
    };

    fetchSongs();
  }, [accessToken, albumId]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchAlbumInfo = async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/albums/${albumId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setAlbumInfo(data); // Lưu thông tin album
      } catch (error) {
        console.error("Error fetching album info:", error);
      }
    };

    fetchAlbumInfo();
  }, [accessToken, albumId]);
  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
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
        
        <div className="px-8 pt-20">
          <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
            {albumInfo?.images?.[0]?.url && (
              <img 
                className="w-48 h-48 rounded shadow-xl" 
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
                <h4>{albumInfo?.artists?.map(artist => artist.name).join(", ")}</h4>
                <span>•</span>
                <p>{songs.length} Songs</p>
                <span>•</span>
                <p>Release Date: {albumInfo?.release_date}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 py-4 px-2 text-[#a7a7a7] border-b border-[#ffffff1a]">
              <p><b className="mr-4">#</b>Title</p>
              <p className="hidden sm:block">Date Released</p>
              <p>Duration</p>
            </div>

            {songs.map((track, index) => (
              <div
                key={track.id}
                onClick={() => playWithTrack({
                  song_name: track.name,
                  song_artist: track.artists.map(artist => artist.name).join(", "),
                  preview_url: track.preview_url,
                  song_image: albumInfo?.images[0]?.url,
                })}
                className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center 
                           text-[#a7a7a7] hover:bg-[#ffffff1a] cursor-pointer 
                           transition-colors duration-200"
              >
                <div className="flex items-center text-white">
                  <span className="w-8 text-[#a7a7a7]">{index + 1}</span>
                  <img
                    className="w-10 h-10 mr-4"
                    src={albumInfo?.images?.[0]?.url || "https://via.placeholder.com/150"}
                    alt=""
                  />
                  <span className="truncate">{track.name}</span>
                </div>
                <p className="text-[15px] hidden sm:block">{albumInfo?.release_date}</p>
                <p className="text-[15px]">{formatDuration(track.duration_ms)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongsByAlbum;
