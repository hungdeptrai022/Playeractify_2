import React,{useContext, useEffect, useState} from 'react'
import Navbar from './Navbar'
import { albumsData } from '../assets/assets'
// import AlbumItem from './AlbumItem'
// import { songsData } from '../assets/assets'
import SongItem from './SongItem'
import { PlayerContext } from '../context/PlayerContext'


const CLIENT_ID = "1b512b5a45e84e56b21ebef0b920b693";
const CLIENT_SECRET = "dc2567d10ddb4a31920f52af2c8b5bd9";


const DisplayHome = () => {
  const [accessToken, setAccessToken] = useState('');
    const [albums, setAlbums] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]); // Thêm state cho nghệ sĩ
    const {playWithTrack} = useContext(PlayerContext);

    useEffect(() => {
      const fetchAccessToken = async () => {
          const authParameters = {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
          };

          try {
              const result = await fetch('https://accounts.spotify.com/api/token', authParameters);
              const data = await result.json();
              setAccessToken(data.access_token);
          } catch (error) {
              console.error('Error fetching access token:', error);
          }
      };

      fetchAccessToken();
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const fetchAlbumsAndTracks = async () => {
        try {
            // Lấy danh sách album phổ biến
            const albumsResponse = await fetch(`https://api.spotify.com/v1/browse/new-releases?limit=8`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const albumsData = await albumsResponse.json();
            setAlbums(albumsData.albums.items);

            // Lấy danh sách bài hát phổ biến
            const tracksResponse = await fetch(`https://api.spotify.com/v1/browse/featured-playlists?limit=8`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const tracksData = await tracksResponse.json();
            const trackList = await Promise.all(
                tracksData.playlists.items.map(async (playlist) => {
                    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=1`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    const data = await response.json();
                    return data.items[0]?.track;
                })
            );
            setTracks(trackList.filter(track => track !== undefined));

            // Lấy danh sách nghệ sĩ nổi bật
            const artistsResponse = await fetch(`https://api.spotify.com/v1/artists?ids=1uNFoZAHBGtllmzznpCI3s,3Nrfpe0tUJi4K4DXYWgMUX,66CXWjxzNUsdJxJ2JdwvnR,6eUKZXaKkcviH0Ku9w2n3V,0du5cEVh5yTK9QJze8zA0C,04gDigrS5kc9YWfZHwBETP,6VuMaDnrHyPL1p4EHjYLi7`, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const artistsData = await artistsResponse.json();
          setArtists(artistsData.artists);

        } catch (error) {
            console.error('Error fetching albums or tracks:', error);
        }
    };

    fetchAlbumsAndTracks();
}, [accessToken]);


  return (
    <>
        <Navbar/>
        {/* <div className='mb-4'>
          <h1 className='my-5 font-bold text-2xl'>Feature Charts</h1>
          <div className='flex overflow-auto'>
            {albumsData.map((item,index)=>(<AlbumItem key={index} name={item.name} desc={item.desc} id={item.id} image={item.image}/>))}
          </div>
        </div>

        <div className='mb-4'>
          <h1 className='my-5 font-bold text-2xl'>Today biggest hit</h1>
          <div className='flex overflow-auto'>
             {songsData.map((item,index)=>(<SongItem key={index} song_name1={item.song_name1} song_artist1={item.song_artist1}  song_image1={item.song_image1} song_id1={item.song_id1}/>))}
             
          </div>
        </div> */}


<div className='p-4'>
        <div className='mb-4'>
            <h1 className='my-5 font-bold text-2xl'>Popular Albums</h1>
            <div className='flex overflow-auto'>
                {albums.map(album => (
                    <div key={album.id} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
                        <img
                            src={album.images[0]?.url}
                            alt={album.name}
                            className='rounded'
                        />
                        <h2 className='font-bold mt-2 mb-1'>{album.name}</h2>
                        <p className='text-slate-200 text-sm'>
                            {album.artists.map(artist => artist.name).join(', ')}
                        </p>
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
                        preview_url: track.preview_url, // Sử dụng preview_url từ Spotify
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

            <div className='mb-4'>
            <h1 className='my-5 font-bold text-2xl'>Popular Artists</h1>
            <div className='flex overflow-auto'>
                {artists.map((artist) => (
                    <div key={artist.id} className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]'>
                        <img
                            src={artist.images ? artist.images[0]?.url : '/placeholder-artist.jpg'}
                            alt={artist.name}
                            className='rounded'
                        />
                        <h2 className='font-bold mt-2 mb-1'>{artist.name}</h2>
                    </div>
                ))}
            </div>
            </div>
        </div>
    </>
  )
}

export default DisplayHome