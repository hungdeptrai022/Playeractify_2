import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";

const SongsByAlbum = () => {
  const { albumId } = useParams(); // Lấy albumId từ URL
  const [songs, setSongs] = useState([]);
  const [accessToken, setAccessToken] = useState("");

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

  return (
    <>
      <Navbar />
      <div className="p-4 text-white mt-16">
        <h1 className="text-2xl mb-4">Songs in Album</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {songs.map((track) => (
            <div key={track.id} className="bg-gray-800 p-4 rounded-md flex flex-col items-center">
              {/* Check if track.album exists and has images */}
              <img
                src={track.album?.images?.[0]?.url || "https://via.placeholder.com/150"} // Fallback image
                alt={track.name}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <h3 className="text-lg text-center">{track.name}</h3>
              <p className="text-gray-400 text-center text-sm">{track.artists.map((artist) => artist.name).join(", ")}</p>
              <button
                className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm mt-2"
                onClick={() => playWithTrack({
                  song_name: track.name,
                  song_artist: track.artists.map(artist => artist.name).join(", "),
                  preview_url: track.preview_url,
                  song_image: track.album.images[0]?.url,
                })}
              >
                Play
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SongsByAlbum;
