import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";
const SongsByArtist = () => {
  const { artistId } = useParams(); // Lấy artistId từ URL
  const [songs, setSongs] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const { playWithTrack } = useContext(PlayerContext);
  const [artistInfo, setArtistInfo] = useState(null); // Thêm state để lưu thông tin nghệ sĩ

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
        const result = await fetch("https://accounts.spotify.com/api/token", authParameters);
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
          `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=VN`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setSongs(data.tracks || []);
      } catch (error) {
        console.error("Error fetching songs by artist:", error);
      }
    };

    fetchSongs();
  }, [accessToken, artistId]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchArtistInfo = async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/artists/${artistId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        setArtistInfo(data); // Lưu thông tin nghệ sĩ
      } catch (error) {
        console.error("Error fetching artist info:", error);
      }
    };

    fetchArtistInfo();
  }, [accessToken, artistId]);

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
    <Navbar/>
    <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
      <img className="w-48 rounded" src={artistInfo?.images[0]?.url} alt="Artist" />
      <div className="flex flex-col">
        <p>Top Tracks</p>
        <h2 className="text-5xl font-bold mb-4 md:text-7xl">
          {artistInfo?.name || "Artist Name"}
        </h2>
        <p className="mt-1">
          <b>$$$ {songs.length} Songs $$$ </b>
        </p>
      </div>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
      <p>
        <b className="mr-4">#</b>Title
      </p>
      <p>Album</p>
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
            song_image: track.album.images[0]?.url,
          })
        }
        className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
      >
        <p className="text-white">
          <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
          <img
            className="inline w-10 mr-5"
            src={
              track.album?.images?.[0]?.url ||
              "https://via.placeholder.com/150"
            }
            alt=""
          />
          {track.name}
        </p>
        <p className="text-[15px]">{track.album.name}</p>
        <p className="text-[15px] hidden sm:block">{track.album.release_date}</p>
        <p className="text-[15px]">{formatDuration(track.duration_ms)}</p>
      </div>
    ))}
    </>
  );
};

export default SongsByArtist;
