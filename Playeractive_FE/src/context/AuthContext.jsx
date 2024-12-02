import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyUser, setSpotifyUser] = useState(null);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
  
        const userDoc = doc(db, "user", currentUser.uid);
        const userSnap = await getDoc(userDoc);
  
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.error("No such user data found in Firestore.");
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });
  
    return unsubscribe;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('spotifyToken');
    if (token) {
      setSpotifyToken(token);
      fetchSpotifyUser(token);
    }
  }, []);

  const fetchSpotifyUser = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSpotifyUser(data);
      } else {
        refreshToken();
      }
    } catch (error) {
      console.error('Error fetching Spotify user:', error);
    }
  };

  const refreshToken = async () => {
    const refresh_token = localStorage.getItem('spotifyRefreshToken');
    if (refresh_token) {
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
            grant_type: 'refresh_token',
            refresh_token: refresh_token
          })
        });
        const data = await response.json();
        localStorage.setItem('spotifyToken', data.access_token);
        setSpotifyToken(data.access_token);
        fetchSpotifyUser(data.access_token);
      } catch (error) {
        console.error('Error refreshing token:', error);
        logoutSpotify();
      }
    }
  };

  const logoutSpotify = () => {
    localStorage.removeItem('spotifyToken');
    localStorage.removeItem('spotifyRefreshToken');
    setSpotifyToken(null);
    setSpotifyUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData,
      spotifyToken,
      spotifyUser,
      logoutSpotify
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
