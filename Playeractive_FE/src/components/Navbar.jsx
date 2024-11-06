import React, { useState, useEffect  } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const CLIENT_ID = "1b512b5a45e84e56b21ebef0b920b693";
const CLIENT_SECRET = "dc2567d10ddb4a31920f52af2c8b5bd9";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Lấy accessToken từ Spotify API khi component được mount
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
        setAccessToken(data.access_token); // Lưu accessToken vào state
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  // Điều hướng đến trang tìm kiếm và truyền query qua URL
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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
        performSearch(); // Tìm kiếm sau khi dừng nghe
      }
    }
     


    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      console.log('Kết quả nhận diện:', transcript);
    };

    recognition.start();
  };
  const performSearch = () => {
    history.push(`/search?query=${encodeURIComponent(searchQuery)}`);
  };
  return (
    <>
      <div className='w-full flex justify-between items-center font-semibold'>
         {/* Navigation Arrows */}
        <div className='flex items-center gap-2'>
          <img onClick={() => navigate(-1)} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_left} alt="Go Back" />
          <img onClick={() => navigate(1)} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_right} alt="Go Forward" />
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
          <img
            src={assets.search_icon}
            alt="Search"
            className="w-6 cursor-pointer"
            onClick={handleSearch}
          />
          <img className="w-6 cursor-pointer" onClick={handleVoiceSearch} src={assets.micro_icon} alt="" /> {isListening && <p>Listening...</p>}
        </div>

        {/* Account Controls */}
        <div className='flex items-center gap-4'>
          <p className='bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer'>Log in</p>
          <p className='bg-black py-1 px-3 rounded-2xl text-[15px] cursor-pointer'>Register</p>
          <p className='bg-purple-500 text-black w-7 h-7 rounded-full flex items-center justify-center'>Q</p>
        </div>
      </div>
      {/* <div className='flex items-center gap-2 mt-4'>
            <p className='bg-white text-black px-4 py-1 rounded-2xl cursor-pointer'>All</p>
            <p className='bg-black px-4 py-1 rounded-2xl cursor-pointer'>Song</p>
            <p className='bg-black px-4 py-1 rounded-2xl cursor-pointer'>Artist</p>
        </div> */}
    </>
  )
}

export default Navbar