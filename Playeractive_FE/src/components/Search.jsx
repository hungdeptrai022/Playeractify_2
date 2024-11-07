import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";

const CLIENT_ID = "1b512b5a45e84e56b21ebef0b920b693";
const CLIENT_SECRET = "dc2567d10ddb4a31920f52af2c8b5bd9";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const { playWithTrack } = useContext(PlayerContext);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [query, setQuery] = useState(new URLSearchParams(location.search).get("q"));
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy accessToken từ Spotify API khi component được mount
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

  // Cập nhật lại query khi URL thay đổi
  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q"));
  }, [location.search]);

  // Tìm kiếm Spotify khi query hoặc accessToken thay đổi
  useEffect(() => {
    const searchSpotify = async () => {
      if (!accessToken || !query) return;

      try {
        const response = await fetch(
         `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist,track,album&limit=30`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();
        setArtists(data.artists?.items || []);
        setSongs(data.tracks?.items || []);
        setAlbums(data.albums?.items || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchSpotify();
  }, [accessToken, query]);

  const navigateToSongsByArtist = (artistId) => {
    navigate(`/search/songs-by-artist/${artistId}`);
  };

  const navigateToSongsByAlbum = (albumId) => {
    navigate(`/search/songs-by-album/${albumId}`);
  };

  const playTrack = (track) => {
    if (playingTrack === track) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track);
    }
  };

  return (
    <><Navbar />
      <div className="p-4 text-white mt-16 flex flex-col items-center">
        <h1 className="text-2xl mb-4">Search Results for "{query}"</h1>

        {isLoading && <p>Loading...</p>}

        {/* Artists Results */}
        <div className="mb-4">
          <h2 className="my-5 font-bold text-2xl">Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artists.map(artist => (
              <div
                key={artist.id}
                className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                onClick={() => navigateToSongsByArtist(artist.id)}
              >
                <img src={artist.images[0]?.url} alt={artist.name} className="w-full h-40 object-cover rounded-md mb-3" />
                <h3 className="font-bold mt-2 mb-1 text-center">{artist.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Songs Results */}
        <div className="mb-4">
          <h2 className="my-5 font-bold text-2xl">Songs</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {songs.map(track => (
              <div key={track.id} className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"  onClick={() => playWithTrack({
                song_name: track.name,
                song_artist: track.artists.map(artist => artist.name).join(", "),
                preview_url: track.preview_url,
                song_image: track.album.images[0]?.url,
              })}>
                <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-40 object-cover rounded-md mb-3" />
                <h3 className="font-bold mt-2 mb-1 text-center">{track.name}</h3>
                <p className="text-slate-200 text-sm text-center">{track.artists.map(artist => artist.name).join(", ")}</p>
                {/* <button
                  className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm"
                  onClick={() => playWithTrack({
                    song_name: track.name,
                    song_artist: track.artists.map(artist => artist.name).join(", "),
                    preview_url: track.preview_url,
                    song_image: track.album.images[0]?.url,
                  })}
                >
                  Play
                </button> */}
              </div>
            ))}
          </div>
        </div>

        {/* Albums Results */}
        <div className="mb-4">
          <h2 className="my-5 font-bold text-2xl">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map(album => (
              <div
                key={album.id}
                className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                onClick={() => navigateToSongsByAlbum(album.id)}
              >
                <img src={album.images[0]?.url} alt={album.name} className="w-full h-40 object-cover rounded-md mb-3" />
                <h3 className="font-bold mt-2 mb-1 text-center">{album.name}</h3>
                <p className="text-slate-200 text-sm text-center">{album.artists.map(artist => artist.name).join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
