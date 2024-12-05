import React, { useState, useEffect, useRef, useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PlayerContext } from '../context/PlayerContext';

const CLIENT_ID = "1b512b5a45e84e56b21ebef0b920b693";
const CLIENT_SECRET = "dc2567d10ddb4a31920f52af2c8b5bd9";
const AUDD_API_KEY = 'd9636c27326a580442a26a117397a43f';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, spotifyUser, logout, userData } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { player } = useContext(PlayerContext);
  const dropdownRef = useRef(null);
  

  //Search with beat
  const [isRecording, setIsRecording] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  

  // Fetch Spotify access token
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

  // Auto search when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 550);

      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  //Login
  const handleSignInClick = () => {
    if (player) {
      player.pause(); // Dừng phát nhạc
    }
    navigate("/singin");
  };
  const handleLogoutClick = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const handleProfileClick = () => {
    navigate("/userprofile");
    setDropdownOpen(false);
  };

  const handleSearchWithBeat = () => {
    if (!navigator.mediaDevices || !("AudioContext" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ ghi âm.");
      return;
    }
  
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
  
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
  
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const formData = new FormData();
          formData.append("file", audioBlob);
          formData.append("api_key", AUDD_API_KEY);
  
          try {
            const response = await axios.post("https://api.audd.io/", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
  
            const { status, result } = response.data;
            if (status === "success" && result) {
              const { artist, title } = result;
              alert(`Tìm thấy bài hát: ${title} của nghệ sĩ ${artist}`);
              navigate(`/search?q=${encodeURIComponent(title)}`);
            } else {
              alert("Không tìm thấy bài hát.");
            }
          } catch (error) {
            console.error("Lỗi khi phân tích âm thanh:", error);
          }
        };
  
        mediaRecorder.start();
        setIsRecording(true);
  
        setTimeout(() => {
          mediaRecorder.stop(); // Dừng ghi âm sau ? giây
          setIsRecording(false);
        }, 8000);
      })
      .catch((error) => {
        console.error("Lỗi khi ghi âm:", error);
      });
  };
  
  

  const handleVoiceSearch = () => {

    if (!('webkitSpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói');
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      if (searchQuery) {
        handleSearch();
      }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      console.log('Kết quả nhận diện:', transcript);

      // Search with Audd.io if it's a song name
      const audioSearchResult = await searchSongWithAudd(transcript);
      if (audioSearchResult) {
        setSearchQuery(audioSearchResult);
        handleSearch();
      }
    };

    recognition.start();
  };


  

  const handleAuthClick = () => {
    if (user) {
      // Nếu đã đăng nhập thì logout
      logout();
      navigate('/');
    }
  };

  return (
    <nav className="flex items-center justify-between p-4">
      {/* Navigation Arrows */}
      <div className="flex items-center gap-2">
        <img
          onClick={() => navigate(-1)}
          className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
          src={assets.arrow_left}
          alt="Go Back"
        />
        <img
          onClick={() => navigate(1)}
          className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
          src={assets.arrow_right}
          alt="Go Forward"
        />
      </div>

      {/* Search Input */}
      <div className='flex items-center gap-3 flex-row'>
        <input
          type="text"
          placeholder='What do you want to play'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className='bg-stone-800 text-center shadow-inner text-white focus:outline-none ml-2 rounded-2xl w-[max(10vw,250px)] h-[max(2vw,35px)] hover:bg-stone-700 focus:bg-stone-700'
        />
        {/* <img
          src={assets.music_note}
          alt="SearchWithBeat"
          className="w-6 cursor-pointer"
          onClick={handleSearchWithBeat}
        /> */}
        {user ? (
          <img
            src={assets.music_note}
            alt="SearchWithBeat"
            className="w-6 cursor-pointer"
            onClick={handleSearchWithBeat}
          />
        ) : (
          <img
            src={assets.music_note}
            alt="SearchWithBeat"
            className="w-6 cursor-pointer"
            onClick={() => alert("You must sign in to use this function")}
          />
        )}
        <img 
          src={assets.micro_icon} 
          alt="Voice Search"
          className="w-6 cursor-pointer" 
          onClick={handleVoiceSearch} 
        />
        {isListening && <p>Listening...</p>}
      </div>

      {/* Account Controls */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {!user ? (
          <p
            className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer"
            onClick={handleSignInClick}
          >
            Sign In
          </p>
        ) : (
          <>
            <p className="text-white text-[15px]">Welcome, {userData?.name || "User"}</p>
            <button
              onClick={toggleDropdown}
              className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl flex items-center justify-center"
            >
              {userData?.name?.charAt(0).toUpperCase() || "U"}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-xl border border-gray-200">
                <button
                  onClick={handleProfileClick}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-100 rounded-t-lg transition-colors duration-200"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-purple-100 rounded-b-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;