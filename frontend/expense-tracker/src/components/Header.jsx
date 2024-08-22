import React, { useEffect, useState } from "react";
import { getUserInitials } from "../utils/helper";

const Header = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  

  const logoutHandler = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    token ? setIsUserLoggedIn(true) : setIsUserLoggedIn(false);

    const userData = localStorage.getItem("user");
    if (userData) {
      const { user: userInfo } = JSON.parse(userData);
      setUser(userInfo);
    }
  }, []);

  return (
    <div>
        <div className="header flex justify-between items-center p-4 bg-blue-500 text-white">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        {isUserLoggedIn && (
            <div className="profile-info flex items-center">
            <img
                src={`https://ui-avatars.com/api/?name=${getUserInitials(user?.firstName)}+${getUserInitials(user?.lastName)}&background=random&gender=female`}
                alt="Profile"
                className="w-10 h-10 rounded-full mr-3"
            />
            <span className="text-lg mr-4">{user?.firstName} {user?.lastName}</span>
            <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => logoutHandler()}
            >
                Logout
            </button>
            </div>
        )}
        </div>
    </div>
  );
};

export default Header;
