import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";


const SongsByAlbum = () => {
  const { albumId } = useParams(); // Lấy albumId từ URL
  const [songs, setSongs] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const { playWithTrack } = useContext(PlayerContext);
  const [albumInfo, setAlbumInfo] = useState(null); 
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
    <>
      <Navbar />
      

      <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
        <img className="w-48 rounded" src={albumInfo?.images[0]?.url} alt="" />
        <div className="flex flex-col">
          <p>Albums</p>
          <h2 className="text-5xl font-bold mb-4 md:text-7xl">
            {albumInfo?.name}
          </h2>
          <h4>{albumInfo?.artists.map((artist) => artist.name).join(", ")}</h4>
          <p className="mt-1">
             <b>{songs.length} Songs </b>
            
          </p>
          <p className="mt-1">Release Date: {albumInfo?.release_date}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
        <p>
          <b className="mr-4">#</b>Title
        </p>
     
        <p className="hidden sm:block">Date Released</p>
        <p>Duration</p>
        
      </div>
      <hr />
      {songs.map((track, index) => (
        <div
          key={track.id}
          onClick={() =>
            playWithTrack({
              song_name: track.name,
              song_artist: track.artists
                .map((artist) => artist.name)
                .join(", "),
              preview_url: track.preview_url,
              song_image: albumInfo?.images[0]?.url,
            })
          }
          className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
        >
          <p className="text-white">
            <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
            <img
              className="inline w-10 mr-5"
              src={
                albumInfo?.images?.[0]?.url ||
                "https://via.placeholder.com/150"
              }
              alt=""
            />
            {track.name}
          </p>
          
          <p className="text-[15px] hidden sm:block">{albumInfo?.release_date} </p>
          <p> <p className="text-[15px]">{formatDuration(track.duration_ms)}</p></p>
        </div>
      ))}
    </>
  );
};

export default SongsByAlbum;
