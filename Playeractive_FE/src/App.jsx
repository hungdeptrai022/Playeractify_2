import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Callback from './pages/Callback/Callback';
import Userprofile from './pages/Userprofile/Userprofile';
import ProtectedRoute from './route/ProtectedRoute';
import Signin from './pages/Signin/Signin';

const App = () => {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/singin' element={<Signin />} />
      <Route path='/callback' element={<Callback />} />
      <Route path='/Userprofile' element={
        
          <Userprofile />
        
      } />
      <Route path='*' element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path='*' element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;