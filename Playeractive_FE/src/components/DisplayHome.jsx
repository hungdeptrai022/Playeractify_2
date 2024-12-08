import React, { useContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useNavigate } from "react-router-dom";
import { PlayerContext } from '../context/PlayerContext';
import { useAuthContext } from '../context/AuthContext';

const DisplayHome = () => {
    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const { playFullTrack } = useContext(PlayerContext);
    const { spotifyToken } = useAuthContext();
    const navigate = useNavigate();
    const navigateToSongsByArtist = (artistId) => {
        navigate(`/search/songs-by-artist/${artistId}`);
      };
    useEffect(() => {
        if (!spotifyToken) return;

        const fetchData = async () => {
            try {
                // Lấy danh sách album phổ biến
                const albumsResponse = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=8`, {
                    headers: { 'Authorization': `Bearer ${spotifyToken}` },
                });
                const albumsData = await albumsResponse.json();
                if (albumsData?.albums?.items) {
                    setAlbums(albumsData.albums.items);
                } else {
                    console.error("Albums data not found:", albumsData);
                    setAlbums([]);
                }

                // Lấy danh sách bài hát phổ biến
                const savedTracksResponse = await fetch(`https://api.spotify.com/v1/me/tracks?limit=20`, {
                    headers: { 'Authorization': `Bearer ${spotifyToken}` },
                });
                const savedTracksData = await savedTracksResponse.json();
                if (savedTracksData?.items) {
                    const userSavedTracks = savedTracksData.items.map(item => item.track);
                    setTracks(userSavedTracks);
                } else {
                    console.error("Saved tracks data not found:", savedTracksData);
                    setTracks([]);
                }

                // Lấy danh sách các nghệ sĩ nghe nhiều nhất
                const topArtistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=8', {
                    headers: { 'Authorization': `Bearer ${spotifyToken}` },
                });
                const topArtistsData = await topArtistsResponse.json();
                if (topArtistsData?.items) {
                    setArtists(topArtistsData.items);
                } else {
                    console.error("Top artists data not found:", topArtistsData);
                    setArtists([]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.status === 401) {
                    console.log('Token expired, need to refresh');
                }
            }
        };

        fetchData();
    }, [spotifyToken]);

    const handlePlayTrack = async (track) => {
        try {
            await playFullTrack(`spotify:track:${track.id}`); // Phát bài hát bằng Spotify URI
        } catch (error) {
            console.error("Error playing track:", error);
            alert("Không thể phát bài hát này. Vui lòng đảm bảo bạn có tài khoản Spotify Premium!");
        }
    };

    return (
        <>
            <Navbar />
            <div className='p-4'>
                <div className="mb-4">
                    <h1 className="my-5 font-bold text-2xl">Popular Albums</h1>
                    <div className="flex overflow-auto">
                        {albums.map(album => (
                            <div
                                key={album.id}
                                className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] select-none"
                                onClick={() => navigate(`/search/songs-by-album/${album.id}`)}
                                tabIndex="-1"
                            >
                                <img src={album.images[0]?.url} alt={album.name} className="rounded" />
                                <h2 className="font-bold mt-2 mb-1 text-center">{album.name}</h2>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='mb-4'>
                    <h1 className='my-5 font-bold text-2xl'>You May Want To Hear</h1>
                    <div className='flex overflow-auto'>
                        {tracks.map(track => (
                            <div
                                key={track.id}
                                className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'
                                onClick={() => handlePlayTrack(track)} // Gọi handlePlayTrack
                            >
                                <img src={track.album.images[0]?.url} alt={track.name} className='rounded' />
                                <h2 className='font-bold mt-2 mb-1 truncate text-center'>{track.name}</h2>
                                <p className="text-slate-200 text-sm text-center">
                      {track.artists.map((artist) => (
                        <span
                          key={artist.id}
                          className="cursor-pointer hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigateToSongsByArtist(artist.id);
                          }}
                        >
                          {artist.name}
                        </span>
                      )).reduce((prev, curr) => [prev, ', ', curr])}
                    </p>
                            </div>
                        ))}
                    </div>
                </div>

                <h1 className="my-5 font-bold text-2xl">Top Artists</h1>
                <div className="flex overflow-auto gap-4">
                    {artists.map((artist) => (
                        <div
                            key={artist.id}
                            className="min-w-[180px] cursor-pointer hover:bg-[#ffffff26] p-2 rounded"
                            onClick={() => navigate(`/search/songs-by-artist/${artist.id}`)}
                        >
                            <img
                                src={artist.images?.[0]?.url || "https://via.placeholder.com/150"}
                                alt={artist.name}
                                className="rounded"
                            />
                            <h2 className="font-bold mt-2">{artist.name}</h2>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default DisplayHome;
