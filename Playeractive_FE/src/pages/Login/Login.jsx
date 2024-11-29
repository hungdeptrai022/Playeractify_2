import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getLoginUrl } from '../../utils/spotify';
import './Login.css';

const Login = () => {
  const { spotifyToken } = useAuthContext();

  if (spotifyToken) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1>Welcome to Playeractive</h1>
        <p>Please sign in with Spotify to continue</p>
        <button onClick={handleLogin} className="spotify-login-button">
          Sign in with Spotify
        </button>
      </div>
    </div>
  );
};

export default Login;
