import React, { useState } from "react";
import { hashPassword } from "../utils/helper";
import axiosInstance from "../utils/axiosInstance";

const SignupForm = () => {

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorState, setErrorState] = useState({})
  const errorMessage = 'Please enter value';

  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentErrorState = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        currentErrorState.email = 'Please enter a valid email';
    }

    if (!firstname || !lastname) {
        currentErrorState.name = "Please enter name";
    }

    // check for password validation with at least 6 characters and contains alphabet and number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
        currentErrorState.password = 'Password must contain at least one alphabet and one number';
    }

    if (password.length < 6) {
        currentErrorState.password = 'Password must be at least 6 characters';
    }
    debugger;
    if (Object.keys(currentErrorState).length) {
        setErrorState(currentErrorState);
        return;
    }

    setErrorState({});

    try{
        const refinedPassword = await hashPassword(password);
        const response = await axiosInstance.post('/user/create-account', {
            firstName: firstname,
            lastName: lastname,
            email,
            password: refinedPassword, // double encoding to prevent direct password exposure
        });

        // check for user logged in and set the token in local storage
        if (response.status === 201) { // once account is created set the token
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/transaction';
        }

        
    } catch (error) {
        console.log('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-4 border rounded-lg shadow-md">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">First Name:</label>
        <input
          type="text"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errorState?.name && !firstname ? 'border-red-500' : ''}`}
        />
        {errorState?.name && !firstname && <p className="text-red-500 text-xs italic mt-2">{errorState?.name}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Last Name:</label>
        <input
          type="text"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errorState?.name && !lastname ? 'border-red-500' : ''}`}
        />
        {errorState?.name && !lastname && <p className="text-red-500 text-xs italic mt-2">{errorState?.name}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          novalidate
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errorState?.email && !email ? 'border-red-500' : ''}`}
        />
        {errorState?.email && <p className="text-red-500 text-xs italic mt-2">{errorState?.email}</p>}
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errorState?.password  ? 'border-red-500' : ''}`}
        />
        {errorState?.password  && <p className="text-red-500 text-xs italic mt-2">{errorState?.password}</p>}
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up
        </button>
      </div>
      <div>
        <p className="text-center mt-4">
          Already have an account? <a href="/login" className="text-blue-500 hover:text-blue-800">Login</a>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;