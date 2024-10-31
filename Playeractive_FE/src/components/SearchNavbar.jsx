
import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const SearchNavbar = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className='w-full justify-between items-center font-semibold'>
            {/* Navigation Arrows */}
            <div className='flex items-center gap-2'>
                <img onClick={() => navigate(-1)} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_left} alt="Go Back" />
                <img onClick={() => navigate(1)} className='w-8 bg-black p-2 rounded-2xl cursor-pointer' src={assets.arrow_right} alt="Go Forward" />
            </div>

            {/* Search Input */}
            <div className='flex items-center gap-3'>
                <input
                    type="text"
                    placeholder='What do you want to play'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='bg-stone-800 text-center shadow-inner text-white focus:outline-none ml-2 rounded-2xl w-[max(10vw,250px)] h-[max(2vw,35px)] hover:bg-stone-700 focus:bg-stone-700'
                />
                <img
                    src={assets.search_icon}
                    alt="Search"
                    className="w-6 cursor-pointer"
                    onClick={handleSearch}
                />
            </div>
            <div className='flex items-center gap-4'>
                <p className='bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer'>Log in</p>
                <p className='bg-black py-1 px-3 rounded-2xl text-[15px] cursor-pointer'>Register</p>
                <p className='bg-purple-500 text-black w-7 h-7 rounded-full flex items-center justify-center'>Q</p>
            </div>
        </div>
    );
};

export default SearchNavbar;
