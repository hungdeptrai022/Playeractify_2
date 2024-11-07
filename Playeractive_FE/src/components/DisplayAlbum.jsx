import React, { useEffect, useState, useContext } from 'react';
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { getSpotifyToken } from '../spotifyConfig'; // Import spotifyConfig

const DisplayAlbum = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const { playwithId } = useContext(PlayerContext);

  // Lấy token và API Spotify
  useEffect(() => {
    const fetchData = async () => {
      const spotifyApi = await getSpotifyToken(); // Lấy token từ spotifyConfig
      if (spotifyApi) {
        try {
          // Lấy thông tin album và bài hát từ Spotify
          const albumData = await spotifyApi.getAlbum(id);
          setAlbum(albumData.body);

          const trackData = await spotifyApi.getAlbumTracks(id);
          setTracks(trackData.body.items);
        } catch (error) {
          console.error('Error fetching album data', error);
        }
      }
    };

    fetchData();
  }, [id]);

  if (!album || tracks.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
        <img className="w-48 rounded" src={album.images[0].url} alt="" />
        <div className="flex flex-col">
          <p>Playlists</p>
          <h2 className="text-5xl font-bold mb-4 md:text-7xl">{album.name}</h2>
          <h4>{album.description || "No description available"}</h4>
          <p className="mt-1">
            <b>Playeractive</b> ** {album.total_tracks} Songs ** about 2 hr 30 mins
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
        <p><b className="mr-4">#</b>Title</p>
        <p>Album</p>
        <p className="hidden sm:block">Date Added</p>
        <img className="m-auto w-4" src="/assets/clock_icon.png" alt="" />
      </div>
      <hr />
      {tracks.map((track, index) => (
        <div
          onClick={() => playwithId(track.id)}
          key={index}
          className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
        >
          <p className="text-white">
            <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
            <img className="inline w-10 mr-5" src={track.album.images[0].url} alt="" />
            {track.name}
          </p>
          <p className="text-[15px]">{album.name}</p>
          <p className="text-[15px] hidden sm:block"> 5 days ago</p>
          <p className="text-[15px] text-center">{track.duration_ms / 1000 / 60} min</p>
        </div>
      ))}
    </>
  );
};

export default DisplayAlbum;
