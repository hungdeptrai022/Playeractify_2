import React, { useState, useEffect, useRef, useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { user, spotifyUser, logout, userData } = useAuthContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { player } = useContext(PlayerContext);
  const dropdownRef = useRef(null);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const searchInputRef = useRef(null);
  

  //Search with beat
  const [isRecording, setIsRecording] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
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
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [location.pathname, location.search]); // Giữ focus khi URL thay đổi

  // Đồng bộ searchQuery với URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q');
    
    if (location.pathname === '/search' && queryParam) {
      setSearchQuery(decodeURIComponent(queryParam));
    }
  }, [location]);

  // Xử lý tìm kiếm với delay dài hơn
  useEffect(() => {
    if (isInitialSearch && searchQuery.trim()) {
      setIsInitialSearch(false);
      return;
    }

    if (!isInitialSearch) {
      if (searchQuery.trim()) {
        // Tăng delay lên 500ms để có thời gian nhập khoảng trắng
        const timer = setTimeout(() => {
          handleSearch();
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // Giữ delay ngắn cho việc quay về home và giữ focus
        const timer = setTimeout(() => {
          if (location.pathname !== '/') {
            navigate('/');
          }
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [searchQuery, isInitialSearch, navigate, location.pathname]);

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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  const [showBeatModal, setShowBeatModal] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);

  const handleSearchWithBeat = async () => {
    if (!navigator.mediaDevices || !("AudioContext" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ ghi âm.");
      return;
    }

    if (player) {
      const state = await player.getCurrentState();
      setWasPlaying(!state?.paused);
      player.pause();
    }

    setShowBeatModal(true);
    setIsRecording(true);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          setIsRecording(false);
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
              const searchText = `${title} ${artist}`;
              
              if (window.confirm(`Đã tìm thấy: "${title}" bởi ${artist}\nBạn có muốn tìm kiếm bài hát này không?`)) {
                setSearchQuery(searchText);
                navigate(`/search?q=${encodeURIComponent(searchText)}`);
              }
            } else {
              alert("Không tìm thấy bài hát.");
            }
          } catch (error) {
            console.error("Lỗi khi phân tích âm thanh:", error);
          } finally {
            setShowBeatModal(false);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            mediaRecorderRef.current = null;
          }
        };

        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 8000);
      })
      .catch((error) => {
        console.error("Lỗi khi ghi âm:", error);
        setIsRecording(false);
        setShowBeatModal(false);
      });
  };

  const handleCloseBeatModal = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (wasPlaying && player) {
      player.resume();
    }
    
    mediaRecorderRef.current = null;
    setShowBeatModal(false);
    setIsRecording(false);
    setWasPlaying(false);
  };

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tìm ki�m bằng giọng nói');
      return;
    }
    
    if (player) {
      player.getCurrentState().then(state => {
        setWasPlaying(!state?.paused);
        player.pause();
      });
    }
    
    const newRecognition = new window.webkitSpeechRecognition();
    setRecognition(newRecognition);
    
    newRecognition.lang = 'vi-VN';
    newRecognition.continuous = false;
    newRecognition.interimResults = false;

    newRecognition.onstart = () => {
      setIsListening(true);
      setShowVoiceModal(true);
    };
    
    newRecognition.onend = () => {
      setIsListening(false);
      setShowVoiceModal(false);
    };

    newRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      
      // Đảm bảo chuyển hướng sau khi đã cập nhật searchQuery
      setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(transcript)}`);
      }, 100);
    };

    newRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setShowVoiceModal(false);
    };

    newRecognition.start();
  };

  const handleCloseVoiceModal = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }

    if (wasPlaying && player) {
      player.resume();
    }

    setShowVoiceModal(false);
    setIsListening(false);
    setWasPlaying(false);
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
          ref={searchInputRef}
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

      {/* SearchByBeat Modal */}
      {showBeatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212121] rounded-lg p-8 flex flex-col items-center gap-4 relative">
            <button 
              onClick={handleCloseBeatModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-white text-xl">Đang nghe bài hát...</h2>
            
            <div className={`w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center ${isRecording ? 'animate-pulse' : ''}`}>
              <img 
                src={assets.music_note}
                alt="Music Note"
                className="w-8 h-8"
              />
            </div>
            
            {/* {isRecording && (
              // <div className="flex gap-2 mt-4">
              //   <div className="w-2 h-8 bg-purple-500 animate-[soundwave_0.5s_ease-in-out_infinite]"></div>
              //   <div className="w-2 h-8 bg-purple-500 animate-[soundwave_0.5s_ease-in-out_infinite_0.1s]"></div>
              //   <div className="w-2 h-8 bg-purple-500 animate-[soundwave_0.5s_ease-in-out_infinite_0.2s]"></div>
              //   <div className="w-2 h-8 bg-purple-500 animate-[soundwave_0.5s_ease-in-out_infinite_0.3s]"></div>
              // </div>
            )} */}
            
            <p className="text-gray-300 text-sm mt-4">
              {isRecording ? 'Đang nhận diện bài hát...' : 'Đang khởi động...'}
            </p>
          </div>
        </div>
      )}

      {/* Voice Search Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#212121] rounded-lg p-8 flex flex-col items-center gap-4 relative">
            <button 
              onClick={handleCloseVoiceModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-white text-xl">Đang nghe...</h2>
            
            <div className={`w-16 h-16 rounded-full bg-red-600 flex items-center justify-center ${isListening ? 'animate-pulse' : ''}`}>
              <img 
                src={assets.micro_icon}
                alt="Microphone"
                className="w-8 h-8"
              />
            </div>
            <p className="text-gray-300 text-sm mt-4">
              {isListening ? 'Hãy nói từ khóa bạn muốn tìm kiếm...' : 'Đang khởi động...'}
            </p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;