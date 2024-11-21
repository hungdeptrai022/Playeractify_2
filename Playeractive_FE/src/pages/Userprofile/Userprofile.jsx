import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import './Userprofile.css'

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
                        console.log("User  data:", userData);
                        setUserEmail(userData.email); // Set email
                        console.log("User  email:", userData.email);
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
        
        <div className="profileContainer">
            <div className="goBack" onClick={() => navigate(-1)}>
                <img
                    src={assets.arrow_left} // Ensure this asset path is correct
                    alt="Go Back"
                    className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
                />
            </div>
            <div className="profileHeader">
                <div className="profileInfo">
                    <img src={assets.spotify_logo} alt="Avatar" className="avatar" />
                    <div className="userDetails">
                    <h2>{userData?.name || 'Name not available'}</h2> {/* Use userData here */}
                    <p>{userEmail || 'Email not available'}</p>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <div className="footerContent">
                    <div className="company">
                        <h4>Company</h4>
                        <ul>
                            <li>About us</li>
                            <li>Legal</li>
                            <li>Copyright</li>
                        </ul>
                    </div>
                    <div className="usefulLink">
                        <h4>Useful link</h4>
                        <ul>
                            <li>Support</li>
                            <li>Keyboard shortcut</li>
                        </ul>
                    </div>
                    <div className="contactUs">
                        <h4>Contact Us</h4>
                        <p>QR-Code</p>
                        <a href="#"><img src={assets.qrcode} alt="" className="icon" /></a>
                        
                    </div>
                </div>
                <div className="footerBottom">
                    <p>BTEC FPT Building, Trinh Van Bo, Nam Tu Liem, Hanoi</p>
                    <p>Email: musicsong@gmail.com | Phone: 097 1234 564</p>
                </div>
            </footer>
        </div>
    );
}

export default UserProfile;