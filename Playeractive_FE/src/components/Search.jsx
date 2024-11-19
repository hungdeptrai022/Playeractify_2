import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { PlayerContext } from "../context/PlayerContext";

const CLIENT_ID = "1b512b5a45e84e56b21ebef0b920b693";
const CLIENT_SECRET = "dc2567d10ddb4a31920f52af2c8b5bd9";
const GENIUS_ACCESS_TOKEN = "gmqn4PfceZZMHF93VnuRff3_sThC4b10VW0-HlprwioeI2EgvyG4j5o4yHdb3BmH";

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
  const [results, setResults] = useState({ songs: [], artists: [], albums: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLyrics, setSelectedLyrics] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  


  const detectSearchType = (query) => {
    if (!query) return null;
    
    const words = query.toLowerCase().trim().split(" ");
    
    // Các pattern phổ biến
    const knownArtists = [
      'coldplay',
      'hieuthuhai',
      'lisa',
      'jennie',
      'newjeans', 
      'đen',
      'sơn tùng mtp',
      'bts',
      'jsol',
      'd-low',
      'colaps',
      'codfish',
      'mck',
      'adele',
      'mono',
      'kda',
      'vũ',
      // Có thể thêm nhiều nghệ sĩ khác
    ];
  
    const songPatterns = ['feat', 'ft.', 'remix', 'official', 'lyric', 'audio','chìm sâu','chán gái 707', 'thằng điên','lối nhỏ'];
    const albumPatterns = ['album', 'ep', 'deluxe', 'edition', 'collection', 'đánh đổi'];
    
    // Kiểm tra patterns trước
    if (songPatterns.some(pattern => query.toLowerCase().includes(pattern))) {
      return 'song';
    } 
    if (albumPatterns.some(pattern => query.toLowerCase().includes(pattern))) {
      return 'album';
    }
    if (knownArtists.some(artist => query.toLowerCase().includes(artist))) {
      return 'artist';
    }

    // Xử lý query có 1 từ
    if (words.length === 1) {
      const word = words[0];
      
      // Kiểm tra nếu từ đó là một số hoặc năm (ví dụ: "1989", "25")
      if (/^\d+$/.test(word)) {
        return 'album';
      }
      
      // Kiểm tra nếu từ đó viết hoa hoàn toàn (ví dụ: "SOUR", "RED")
      if (word === word.toUpperCase() && word.length > 2) {
        return 'album';
      }
      
      
      // Mặc định là bài hát cho query 1 từ
      return 'song';
    }

    // Xử lý query có 2 từ
   
    if (words.length <= 2) {
      // Kiểm tra các điều kiện để xác định tên nghệ sĩ
      const isArtistName = (
        // Điều kiện 1: Mỗi từ đều bắt đầu bằng chữ hoa
        words.every(word => word[0] === word[0].toUpperCase()) ||
        
        // Điều kiện 2: Từ đầu tiên là "the", "dj", "mc"
        ['the', 'dj', 'mc'].includes(words[0]) ||
        
        // Điều kiện 3: Không chứa các từ thông dụng của bài hát
        !words.some(word => ['love', 'baby', 'heart', 'night', 'day'].includes(word))
      );
  
      if (isArtistName) {
        return 'artist';
      }
    }

    // Xử lý query có nhiều hơn 2 từ
    if (words.length > 2) {
      // Nếu từ cuối cùng là năm hoặc số
      if (/^\d+$/.test(words[words.length - 1])) {
        return 'album';
      }
      
      // Mặc định là bài hát cho query dài
      return 'song';
    }

    // Thêm pattern cho lyrics
    const lyricsPattern = /lyrics:|loi:|lời:/i;
    
    if (lyricsPattern.test(query)) {
      return 'lyrics';
    }

    // Mặc định trả về song nếu không match với các rule trên
    return 'song';
  };

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

  const searchGenius = async (query) => {
    try {
      const response = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`
        }
      });
      const data = await response.json();
      return data.response.hits;
    } catch (error) {
      console.error("Error searching Genius:", error);
      return [];
    }
  };

  const matchSpotifyWithGenius = async (geniusResults) => {
    const matchedTracks = await Promise.all(
      geniusResults.map(async (hit) => {
        const songTitle = hit.result.title;
        const artistName = hit.result.primary_artist.name;
        
        // Tìm bài hát tương ứng trên Spotify
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(`track:${songTitle} artist:${artistName}`)}&type=track&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        const data = await response.json();
        
        if (data.tracks.items.length > 0) {
          return {
            ...data.tracks.items[0],
            geniusId: hit.result.id,
            geniusUrl: hit.result.url
          };
        }
        return null;
      })
    );
    
    return matchedTracks.filter(track => track !== null);
  };

  // Tìm kiếm Spotify khi query hoặc accessToken thay đổi
  useEffect(() => {
    const searchSpotify = async () => {
      if (!accessToken || !query) return;
      
      setIsSearching(true);
      const searchType = detectSearchType(query);
      const cleanQuery = query.replace(/lyrics:|loi:|lời:/i, '').trim();

      try {
        if (searchType === 'lyrics') {
          const geniusResults = await searchGenius(cleanQuery);
          const matchedTracks = await matchSpotifyWithGenius(geniusResults);
          
          setSongs(matchedTracks);
          setArtists([]);
          setAlbums([]);
        } else {
          const response = await fetch(
           `https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanQuery)}&type=artist,track,album&limit=30`,
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
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchSpotify, 500);
    return () => clearTimeout(timeoutId);
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

  const searchType = detectSearchType(query); // Xác định loại tìm kiếm

  useEffect(() => {
    // Gọi API khi có từ khóa tìm kiếm
    const fetchResults = async () => {
      const data = await searchSpotify(query)
      setResults(data);
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  // Thêm component hiển thị lyrics
  const LyricsModal = ({ geniusUrl, isOpen, onClose }) => {
    const [lyrics, setLyrics] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
      const fetchLyrics = async () => {
        if (!geniusUrl) return;
        
        try {
          setIsLoading(true);
          const response = await fetch(`/api/lyrics?url=${encodeURIComponent(geniusUrl)}`);
          const data = await response.json();
          setLyrics(data.lyrics);
        } catch (error) {
          console.error("Error fetching lyrics:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      if (isOpen) {
        fetchLyrics();
      }
    }, [geniusUrl, isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-end">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Đang tải lyrics...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{lyrics}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <><Navbar />
      <div className="p-4 text-white mt-16 flex flex-col items-center">
        <h1 className="text-2xl mb-4">Search Results for "{query}"</h1>

        {isLoading && <p>Loading...</p>}

        {searchType === 'artist' && (
          <div>
            <div className="mb-4">
              <h2 className="my-5 font-bold text-2xl">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                    onClick={() => navigateToSongsByArtist(artist.id)}
                  >
                    <img
                      src={artist.images[0]?.url}
                      alt={artist.name}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-bold mt-2 mb-1 text-center">
                      {artist.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h2 className="my-5 font-bold text-2xl">Songs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {songs.map((track) => (
                  <div
                    key={track.id}
                    className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
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
                  >
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.name}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-bold mt-2 mb-1 text-center">
                      {track.name}
                    </h3>
                    <p className="text-slate-200 text-sm text-center">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                    {track.geniusUrl && (
                      <button
                        onClick={() => setSelectedLyrics(track.geniusUrl)}
                        className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
                      >
                        Xem lyrics
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h2 className="my-5 font-bold text-2xl">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                    onClick={() => navigateToSongsByAlbum(album.id)}
                  >
                    <img
                      src={album.images[0]?.url}
                      alt={album.name}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-bold mt-2 mb-1 text-center">
                      {album.name}
                    </h3>
                    <p className="text-slate-200 text-sm text-center">
                      {album.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} 

        {/* Song Results */}
        {searchType === 'song' && (
          <div>
            <div className="mb-4">
            <h2 className="my-5 font-bold text-2xl">Songs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {songs.map((track) => (
                <div
                  key={track.id}
                  className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
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
                >
                  <img
                    src={track.album.images[0]?.url}
                    alt={track.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-bold mt-2 mb-1 text-center">
                    {track.name}
                  </h3>
                  <p className="text-slate-200 text-sm text-center">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  {track.geniusUrl && (
                    <button
                      onClick={() => setSelectedLyrics(track.geniusUrl)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
                    >
                      Xem lyrics
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="my-5 font-bold text-2xl">Artists</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                  onClick={() => navigateToSongsByArtist(artist.id)}
                >
                  <img
                    src={artist.images[0]?.url}
                    alt={artist.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-bold mt-2 mb-1 text-center">
                    {artist.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        
          <div className="mb-4">
            <h2 className="my-5 font-bold text-2xl">Albums</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                  onClick={() => navigateToSongsByAlbum(album.id)}
                >
                  <img
                    src={album.images[0]?.url}
                    alt={album.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-bold mt-2 mb-1 text-center">
                    {album.name}
                  </h3>
                  <p className="text-slate-200 text-sm text-center">
                    {album.artists.map((artist) => artist.name).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        )} 
        {/*Albums Results */}
        {searchType === 'album' && (
          <div>
            <div className="mb-4">
              <h2 className="my-5 font-bold text-2xl">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                    onClick={() => navigateToSongsByAlbum(album.id)}
                  >
                    <img
                      src={album.images[0]?.url}
                      alt={album.name}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-bold mt-2 mb-1 text-center">
                      {album.name}
                    </h3>
                    <p className="text-slate-200 text-sm text-center">
                      {album.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h2 className="my-5 font-bold text-2xl">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
                    onClick={() => navigateToSongsByArtist(artist.id)}
                  >
                    <img
                      src={artist.images[0]?.url}
                      alt={artist.name}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-bold mt-2 mb-1 text-center">
                      {artist.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h2 className="my-5 font-bold text-2xl">Songs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {songs.map((track) => (
                  <div
                    key={track.id}
                    className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
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
                  >
                    <img
                      src={track.album.images[0]?.url}
                      alt={track.name}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-bold mt-2 mb-1 text-center">
                      {track.name}
                    </h3>
                    <p className="text-slate-200 text-sm text-center">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </p>
                  
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )} 
        <LyricsModal
          geniusUrl={selectedLyrics}
          isOpen={!!selectedLyrics}
          onClose={() => setSelectedLyrics(null)}
        />
      </div>
    </>
  );
};

export default Search;
