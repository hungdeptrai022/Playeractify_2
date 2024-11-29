import React, { useContext, useEffect, useState } from 'react'
import Navbar from './Navbar'
import { useNavigate } from "react-router-dom";
import { PlayerContext } from '../context/PlayerContext'
import { useAuthContext } from '../context/AuthContext';

const DisplayHome = () => {
    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const { playWithTrack } = useContext(PlayerContext);
    const { spotifyToken } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!spotifyToken) return;

        const fetchAlbumsAndTracks = async () => {
            try {
                // Lấy danh sách album phổ biến
                const albumsResponse = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=8`, {
                    headers: { 'Authorization': `Bearer ${spotifyToken}` }
                });
                const albumsData = await albumsResponse.json();
                setAlbums(albumsData.albums.items);

                // Lấy danh sách bài hát phổ biến
                const tracksResponse = await fetch(`https://api.spotify.com/v1/browse/featured-playlists?limit=8`, {
                    headers: { 'Authorization': `Bearer ${spotifyToken}` }
                });
                const tracksData = await tracksResponse.json();
                const trackList = await Promise.all(
                    tracksData.playlists.items.map(async (playlist) => {
                        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=1`, {
                            headers: { 'Authorization': `Bearer ${spotifyToken}` }
                        });
                        const data = await response.json();
                        return data.items[0]?.track;
                    })
                );
                setTracks(trackList.filter(track => track !== undefined));

                // Lấy danh sách nghệ sĩ nổi bật
                const artistsResponse = await fetch(`https://api.spotify.com/v1/artists?ids=2CIMQHirSU0MQqyYHq0eOx%2C57dN52uHvrHOxijzpIgu3E%2C1vCWHaC5f2uS3yhpwWbIA6`, {
                    headers: { 'Authorization': `Bearer ${spotifyToken}` }
                });
                const artistsData = await artistsResponse.json();
                setArtists(artistsData.artists);

            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.status === 401) {
                    console.log('Token expired, need to refresh');
                }
            }
        };

        fetchAlbumsAndTracks();
    }, [spotifyToken]);

    const handleAlbumClick = (albumId) => {
        navigate(`/search/songs-by-album/${albumId}`);
    };

    const handleArtistClick = (artistId) => {
        navigate(`/search/songs-by-artist/${artistId}`);
    };
   
    return (
        <>
            <Navbar />
            <div className='p-4'>
                <div className="mb-4">
                    <h1 className="my-5 font-bold text-2xl">Popular Albums</h1>
                    <div className="flex overflow-auto">
                        {albums.map((album) => (
                            <div
                                key={album.id}
                                className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                                onClick={() => handleAlbumClick(album.id)}
                            >
                                <img
                                    src={album.images[0]?.url}
                                    alt={album.name}
                                    className="rounded"
                                />
                                <h2 className="font-bold mt-2 mb-1">{album.name}</h2>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='mb-4'>
                    <h1 className='my-5 font-bold text-2xl'>Popular Tracks</h1>
                    <div className='flex overflow-auto'>
                        {tracks.map(track => (
                            <div key={track.id} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]' onClick={() =>
                                playWithTrack({
                                    song_name: track.name,
                                    song_artist: track.artists
                                        .map((artist) => artist.name)
                                        .join(", "),
                                    preview_url: track.preview_url,
                                    song_image: track.album.images[0]?.url,
                                })
                            }>
                                <img
                                    src={track.album.images[0]?.url}
                                    alt={track.name}
                                    className='rounded'
                                />
                                <h2 className='font-bold mt-2 mb-1'>{track.name}</h2>
                                <p className='text-slate-200 text-sm'>
                                    {track.artists.map(artist => artist.name).join(', ')}
                                </p>

                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h1 className="my-5 font-bold text-2xl">Popular Artists</h1>
                    <div className="flex overflow-auto">
                        {artists.map((artist) => (
                            <div
                                key={artist.id}
                                className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                                onClick={() => handleArtistClick(artist.id)}
                            >
                                <img
                                    src={
                                        artist.images ? artist.images[0]?.url : "/placeholder-artist.jpg"
                                    }
                                    alt={artist.name}
                                    className="rounded"
                                />
                                <h2 className="font-bold mt-2 mb-1">{artist.name}</h2>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default DisplayHome