import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
 return (
    <>
      <header className="bg-black border-b border-yellow-300 text-yellow-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col justify-center items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-yellow-300 hover:text-yellow-200 mb-2 sm:mb-0 self-center sm:self-auto transition duration-200"
          >
            Min Reseapp
          </Link>
        </div>
      </header>
    </>
  );
};

export default Header;