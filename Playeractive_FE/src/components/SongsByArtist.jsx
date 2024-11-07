import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
const SongsByArtist = () => {
  const { artistId } = useParams(); // Lấy artistId từ URL
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

  return (
    <>
    <Navbar/>
    <div className="p-4 text-white mt-16">
      <h1 className="text-2xl mb-4">Songs by Artist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto">
        {songs.map((track) => (
          <div key={track.id} className="bg-gray-800 p-4 rounded-md flex flex-col items-center">
            <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-40 object-cover rounded-md mb-3" />
            <h3 className="text-lg text-center">{track.name}</h3>
            <p className="text-gray-400 text-center text-sm">{track.artists.map((artist) => artist.name).join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default SongsByArtist;
