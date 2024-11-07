import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const CLIENT_ID = '1cc098e6dbf94a3584082f5046b947f2'; // Thay bằng Client ID của bạn
  const REDIRECT_URI = 'http://localhost:5173/callback'; // Thay bằng Redirect URI của bạn
  const SCOPES = 'user-library-read user-read-private';  // Quyền truy cập bạn cần

  // Hàm điều hướng người dùng đến trang đăng nhập của Spotify
  const handleLogin = () => {
    const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = AUTH_URL; // Điều hướng người dùng đến trang đăng nhập Spotify
  };

  return (
    <div>
      <h2>Login to Spotify</h2>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
};

export default Login;
