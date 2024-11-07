import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";

const CLIENT_ID = "1cc098e6dbf94a3584082f5046b947f2";
const CLIENT_SECRET = "873020b0be3e400690e57903e8e02953";

const Search = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const { playWithTrack } = useContext(PlayerContext);
  const [playingTrack, setPlayingTrack] = useState(null);
  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    const fetchAccessToken = async () => {
      const authParameters = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
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
    const searchSpotify = async () => {
      if (!accessToken || !query) return;

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            query
          )}&type=track&limit=50`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();
        setSearchResults(data.tracks ? data.tracks.items : []);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    searchSpotify();
  }, [accessToken, query]);

  const playTrack = (track) => {
    if (playingTrack === track) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 text-white mt-16 flex flex-col items-center">
        <h1 className="text-2xl mb-4">Search Results for "{query}"</h1>

        {/* Grid layout cho kết quả */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {searchResults.map((track) => (
            <div
              key={track.id}
              className="bg-gray-800 p-4 rounded-md flex flex-col items-center cursor-pointer"
              onClick={() =>
                playWithTrack({
                  song_name: track.name,
                  song_artist: track.artists
                    .map((artist) => artist.name)
                    .join(", "),
                  preview_url: track.preview_url, // Sử dụng preview_url từ Spotify
                  song_image: track.album.images[0]?.url,
                })
              }
              
            >
              <img
                src={track.album.images[0]?.url}
                alt={track.name}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <h2 className="text-lg text-center">{track.name}</h2>
              <p className="text-gray-400 text-center text-sm mb-3">
                {track.artists.map((artist) => artist.name).join(", ")}
              </p>
              {/* <button
                className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm"
                onClick={() =>
                  playWithTrack({
                    song_name: track.name,
                    song_artist: track.artists
                      .map((artist) => artist.name)
                      .join(", "),
                    preview_url: track.preview_url, // Sử dụng preview_url từ Spotify
                    song_image: track.album.images[0]?.url,
                  })
                }
              >
                Play
              </button> */}
            </div>
          ))}
        </div>

        {/* Audio player cho bài hát đang phát */}
        {/* {playingTrack && (
          <audio
            controls
            autoPlay
            src={playingTrack.preview_url}
            onEnded={() => setPlayingTrack(null)}
            className="mt-4"
          >
            Your browser does not support the audio element.
          </audio>
        )} */}
      </div>
    </>
  );
};

export default Search;
