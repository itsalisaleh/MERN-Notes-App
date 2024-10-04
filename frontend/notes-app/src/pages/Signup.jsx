

import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Passwordinput } from '../components/Passwordinput';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance'; // Make sure axiosInstance is imported

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name) {
      setError('Please enter your name');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!password) {
      setError('Please enter a valid password');
      return;
    }
    setError(''); // Clear any previous errors

    // Signup API call
    try {
      const response = await axiosInstance.post('/create-account', {
        fullName: name, 
        email: email,
        password: password,
      });

      // Handle success signup response
        if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate('/dashboard');
      }
    } catch (error) {
      // Debug the error in console to see the actual issue
      console.error('Signup error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">Signup</h4>
            <input
              type="text"
              placeholder="Name"
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Passwordinput value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Create account
            </button>
            <p className="text-sm text-center mt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary underline">
                Log in Here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};
