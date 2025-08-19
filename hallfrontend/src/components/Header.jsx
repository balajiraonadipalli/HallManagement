

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { toast, ToastContainer } from 'react-toastify';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, setToken, adm, setAdm } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem("adm");
    setToken(null);
    setAdm("user");
    navigate('/Login');
    toast.success("Logged out");
    setIsMenuOpen(false); // Close mobile menu on logout
  }, [navigate, setToken, setAdm]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-icon')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <header className='header'>
        <h4 className='logo'>Hall Booking System</h4>
        <nav className='nav-links'>
          <Link to="/Booking" className='nav-link'>Booking</Link>
          {adm === "admin" && (
            <>
              <Link to="/addDeptHall" className='nav-link'>Add Components</Link>
              <Link to="/PendingList" className='nav-link'>Pending List</Link>
            </>
          )}
          {token ? (
            <button className='logout-btn' onClick={handleLogout}>Log Out</button>
          ) : (
            <button className='login-btn' onClick={() => navigate("/Login")}>Log In</button>
          )}
        </nav>
        <div className='menu-icon' onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </div>
      </header>

      {isMenuOpen && (
        <div className='mobile-menu'>
          <Link to="/Booking" className='mobile-link' onClick={() => setIsMenuOpen(false)}>Booking</Link>
          {adm === "admin" && (
            <>
              <Link to="/addDeptHall" className='mobile-link' onClick={() => setIsMenuOpen(false)}>Add Components</Link>
              <Link to="/PendingList" className='mobile-link' onClick={() => setIsMenuOpen(false)}>Pending List</Link>
            </>
          )}
          {token ? (
            <button className='mobile-logout-btn' onClick={handleLogout}>Log Out</button>
          ) : (
            <button className='mobile-login-btn' onClick={() => {
              navigate("/Login");
              setIsMenuOpen(false);
            }}>Log In</button>
          )}
        </div>
      )}
      <ToastContainer />
    </>
  );
}

export default Header;