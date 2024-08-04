import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../context/LoginContext'; // Import the custom hook for login context
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Navbar = () => {
  const { user, logout } = useLogin(); // Get user information and logout function from context
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogout = () => {
    logout(); // Call logout function
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand fs-2 mx-1" to="/">
          <img
            src={`${process.env.PUBLIC_URL}/img/logo.png`}
            alt="writer"
            className="logo-img"
          />
          마음챙기기
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/diary">Diary</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/calendar">Mood Tracker</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/mypage">My Page</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/MoodPage">MoodPage</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
          {user && (
            <ul className="navbar-nav">
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
