import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = localStorage.getItem('spotify_auth_state');
      
      // Xóa state đã lưu
      localStorage.removeItem('spotify_auth_state');

      // Kiểm tra state
      if (!state || state !== storedState) {
        setError('State mismatch. Please try again');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (code) {
        try {
          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(
                `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${import.meta.env.VITE_SPOTIFY_CLIENT_SECRET}`
              )
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || 'Failed to get access token');
          }

          const data = await response.json();
          
          if (data.access_token) {
            localStorage.setItem('spotifyToken', data.access_token);
            localStorage.setItem('spotifyRefreshToken', data.refresh_token);
            navigate('/');
          }
        } catch (error) {
          console.error('Error:', error);
          setError(error.message);
          setTimeout(() => navigate('/login'), 3000);
        }
      }
    };

    fetchAccessToken();
  }, [navigate]);

  if (error) {
    return (
      <div className="callback-error">
        <h2>Error occurred</h2>
        <p>{error}</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="callback-loading">
      <h2>Processing login...</h2>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Callback;
