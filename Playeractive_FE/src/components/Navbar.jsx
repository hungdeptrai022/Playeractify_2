import React, { useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const CLIENT_ID = "1b512b5a45e84e56b21ebef0b920b693";
const CLIENT_SECRET = "dc2567d10ddb4a31920f52af2c8b5bd9";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
  // Tự động tìm kiếm khi searchQuery thay đổi
  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        handleSearch(); // Gọi tìm kiếm sau 550ms
      }, 550); // Điều chỉnh thời gian nếu cần

      return () => clearTimeout(timer); // Dọn dẹp khi `searchQuery` thay đổi trước khi hết thời gian
    }
  }, [searchQuery]);

  // Điều hướng đến trang tìm kiếm và truyền query qua URL
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Tìm kiếm bằng giọng nói
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'vi-VN'; // Đặt ngôn ngữ tiếng Việt
    recognition.continuous = false; // Dừng nhận diện khi dừng nói
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      if (searchQuery) {
        handleSearch(); // Tìm kiếm sau khi nhận diện kết thúc
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript); // Cập nhật searchQuery khi nhận diện giọng nói
      console.log('Kết quả nhận diện:', transcript);
    };

    recognition.start();
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleProfileClick = () => {
    console.log('Profile clicked');
  };

  const handleLogoutClick = () => {
    console.log('Logout clicked');
  };

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

  return (
    <div className="w-full flex justify-between items-center font-semibold">
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
          onChange={(e) => setSearchQuery(e.target.value)} // Cập nhật searchQuery khi người dùng nhập
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Tìm kiếm khi nhấn Enter
          className='bg-stone-800 text-center shadow-inner text-white focus:outline-none ml-2 rounded-2xl w-[max(10vw,250px)] h-[max(2vw,35px)] hover:bg-stone-700 focus:bg-stone-700'
        />
        <img
          src={assets.search_icon}
          alt="Search"
          className="w-6 cursor-pointer"
          onClick={handleSearch} // Tìm kiếm khi click vào biểu tượng tìm kiếm
        />
        <img className="w-6 cursor-pointer" onClick={handleVoiceSearch} src={assets.micro_icon} alt="" />
        {isListening && <p>Listening...</p>}
      </div>

      {/* Account Controls */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
      <p
             className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer"
             onClick={() => navigate("/login")}
        >
         Sign In
        </p>
        <button
          onClick={toggleDropdown}
          className="bg-purple-500 text-black w-7 h-7 rounded-full flex items-center justify-center"
        >
          Q
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
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
      </div>
    </div>
  );
};

export default Navbar;
