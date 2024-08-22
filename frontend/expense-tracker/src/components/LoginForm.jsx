import React, { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { hashPassword } from "../utils/helper";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // stop password exposure
    if (!email || !password) {
        setErrorMessage("Please enter value");
        return;
    }

    try{
        const refinedPassword = await hashPassword(password);
        const response = await axiosInstance.post('/user/login', {
            email,
            password: refinedPassword, // double encoding to prevent direct password exposure
        });
        // check for user logged in and set the token in local storage
        if (response.status === 200) {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/transaction';
        }
    } catch (error) {
        console.log('Error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-10 py-10">
        <h2 className="text-2xl font-semibold mb-5">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="">Email:</label>
            <input
              className={`border rounded px-2 py-1 w-full ${errorMessage && !email ? 'border-red-500' : ''} ` }
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errorMessage && !email && <p className="text-red-500 text-xs italic mt-2">{errorMessage}</p>}
          </div>
          
          <div>
            <label>Password:</label>
            <input
              type="password"
              className={`border rounded px-2 py-1 w-full ${errorMessage && !password ? 'border-red-500' : ''} ` }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errorMessage && !password && <p className="text-red-500 text-xs italic mt-2">{errorMessage}</p>}
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-3 py-1 mt-5 rounded"
          >
            Login
          </button>
            <p className="mt-5">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-500">
                Sign Up
                </Link>
            </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
