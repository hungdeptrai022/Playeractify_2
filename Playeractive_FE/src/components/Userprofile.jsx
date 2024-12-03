import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

import Navbar from './Navbar';


const UserProfile = () => {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const { user, userData } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            console.log("Current user:", user);

            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'user', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        console.log("User data:", userData);
                        setUserEmail(userData.email); // Set email
                        console.log("User email:", userData.email);
                    } else {
                        console.error("No such document!");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                console.error("No user logged in!");
            }
        };

        fetchUserData();
    }, [user]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-center min-h-screen  text-white">
            
                <div className="profileContainer w-full max-w-2xl p-6 rounded-lg shadow-lg">
                    <div className="profileHeader mb-6">
                        <div className="profileInfo flex items-center">
                            <img src={assets.spotify_logo} alt="Avatar" className="avatar w-24 h-24 rounded-full" />
                            <div className="userDetails ml-4">
                                <h2 className="text-2xl font-bold">{userData?.name || 'Name not available'}</h2>
                                <p className="text-gray-400">{userEmail || 'Email not available'}</p>
                            </div>
                        </div>
                    </div>

                    <footer className="footer mt-6">
                        <div className="footerContent grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="company">
                                <h4 className="font-bold">Company</h4>
                                <ul className="list-disc pl-5">
                                    <li>About us</li>
                                    <li>Legal</li>
                                    <li>Copyright</li>
                                </ul>
                            </div>
                            <div className="usefulLink">
                                <h4 className="font-bold">Useful link</h4>
                                <ul className="list-disc pl-5">
                                    <li>Support</li>
                                    <li>Keyboard shortcut</li>
                                </ul>
                            </div>
                            <div className="contactUs">
                                <h4 className="font-bold">Contact Us</h4>
                                <p>QR-Code</p>
                                <a href="#"><img src={assets.qrcode} alt="" className="icon w-10 h-10" /></a>
                            </div>
                        </div>
                        <div className="footerBottom mt-4">
                            <p>BTEC FPT Building, Trinh Van Bo, Nam Tu Liem, Hanoi</p>
                            <p>Email: musicsong@gmail.com | Phone: 097 1234 564</p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}

export default UserProfile;