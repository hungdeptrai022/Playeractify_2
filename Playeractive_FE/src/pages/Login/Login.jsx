import React, { useState } from 'react';
import './Login.css';
import { login, signup } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
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
      if (signState === "Sign In") {
        await login(email, password);
        navigate('/'); // Navigate to homepage on successful login
      } else {
        await signup(name, email, password);
        setSuccess("Account created successfully. Please sign in."); // Set success message
        setsignState("Sign In"); // Switch to "Sign In" form after successful signup
      }
    } catch (error) {
      setError("Invalid email or password. Please try again."); // Set error message
      console.error("Authentication error:", error); // Log error to console for debugging
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
