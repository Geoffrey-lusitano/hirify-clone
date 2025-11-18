import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import EditProfileStudent from './components/EditProfileStudent';
import Suggest from './components/Suggest';
import Suggestions from './components/Suggestions';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <EditProfileStudent />
        </ProtectedRoute>
      } />
      <Route path="/suggest" element={
        <ProtectedRoute>
          <Suggestions />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
