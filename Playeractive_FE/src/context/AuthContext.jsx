import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Lưu thông tin `name`

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
  
        // Fetch user's additional details
        const userDoc = doc(db, "user", currentUser.uid);
        const userSnap = await getDoc(userDoc);
  
        if (userSnap.exists()) {
          setUserData(userSnap.data()); // Lưu `name` vào `userData`
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

  return (
    <AuthContext.Provider value={{ user, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
