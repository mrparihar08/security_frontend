import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Navbar from './pages/Navbar';
import SecurityChat from './components/Chat/SecurityChat';
import DocumentVerification from './pages/DocumentVerification';
import Checkpoint from './pages/Checkpoint';
import Alerts from './pages/Alerts';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('security_token');
  return isAuthenticated ? (
    <>
      <Navbar />
      {children}
    </>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={<PrivateRoute><Dashboard /></PrivateRoute>} 
          />
          <Route 
            path="/profile" 
            element={<PrivateRoute><Profile /></PrivateRoute>} 
          />
          <Route 
            path="/chat" 
            element={<PrivateRoute><SecurityChat /></PrivateRoute>} 
          />
          <Route 
            path="/verifications" 
            element={<PrivateRoute><DocumentVerification /></PrivateRoute>} 
          />
          <Route 
            path="/checkpoint" 
            element={<PrivateRoute><Checkpoint /></PrivateRoute>} 
          />
          <Route 
            path="/alerts" 
            element={<PrivateRoute><Alerts /></PrivateRoute>} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
