import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        const CLIENT_ID = '1cc098e6dbf94a3584082f5046b947f2';
        const CLIENT_SECRET = '873020b0be3e400690e57903e8e02953';
        const REDIRECT_URI = 'http://localhost:5173/callback';

        // Gửi mã xác thực để lấy token
        const authHeader = 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET);
        const body = new URLSearchParams();
        body.append('grant_type', 'authorization_code');
        body.append('code', code);
        body.append('redirect_uri', REDIRECT_URI);

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body
        });

        const data = await response.json();

        if (data.access_token) {
          setToken(data.access_token);  // Lưu token vào state
          navigate('/');  // Điều hướng về trang home sau khi lấy token thành công
        } else {
          console.error('Failed to get access token');
        }
      }
    };

    fetchAccessToken();
  }, [navigate]);

  return (
    <div>
      {token ? <h1>Login successful!</h1> : <h1>Loading...</h1>}
    </div>
  );
};

export default Callback;
