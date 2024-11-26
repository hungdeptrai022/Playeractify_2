import React, { useState, useContext } from 'react';
import './Login.css';
import { login, signup } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { PlayerContext } from '../../context/PlayerContext';


const Login = () => {
  const { updateUserState } = useContext(PlayerContext);


  const [signState, setsignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State to store error messages
  const [success, setSuccess] = useState(null); // State to store success message
  const navigate = useNavigate();

  const user_auth = async (event) => {
    event.preventDefault();
    try {
      setError(null); // Clear previous errors
      setSuccess(null); // Clear previous success message

      if (signState === "Sign In") {
        await login(email, password);
        updateUserState(email); // Cập nhật email người dùng sau khi đăng nhập
        navigate('/'); // Điều hướng đến trang chủ
      } else {
        if (!name.trim()) {
          setError("Name is required for Sign Up.");
          return;
        }
        await signup(name, email, password);
        setSuccess("Account created successfully. Please sign in.");
        setsignState("Sign In"); // Chuyển về trạng thái đăng nhập
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className='login'>
      <div className="login-form">
        <h1>{signState}</h1>
        <form onSubmit={user_auth}>
          {signState === "Sign Up" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder='Your name'
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder='Email'
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder='Password'
          />
          <button type='submit'>{signState}</button>

          {/* Display error or success message */}
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-help">
            <div className="remember">
              <input type="checkbox" />
              <label>Remember Me</label>
            </div>
            <p>Need help?</p>
          </div>
        </form>
        <div className='form-switch'>
          {signState === "Sign In" ? (
            <p>New to Actify? <span onClick={() => { setsignState("Sign Up"); setError(null); setSuccess(null); }}>Sign Up now</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => { setsignState("Sign In"); setError(null); setSuccess(null); }}>Sign In now</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
