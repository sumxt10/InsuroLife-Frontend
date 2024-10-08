import { useState, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { UserContext } from '../../store/user-context';

import MainLogo from '../../assets/insurolife-logo.svg';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { isLoggedIn, user } = useContext(UserContext);

  const toggleMenu = () => setMenuOpen(prevState => !prevState);

  return (
    <header className='header bg-white header-padd'>
      <div className='container d-flex justify-content-between align-items-center'>
        <a href='/' className='d-flex align-items-center text-decoration-none'>
          <img src={MainLogo} alt='Logo' className='logo' />
          <div className='ml-3'>
            <h1 className='mb-0 mx-2 title'>Insurolife</h1>
          </div>
        </a>
        <button className='hamburger' onClick={toggleMenu}>
          <span className='bar'></span>
          <span className='bar'></span>
          <span className='bar'></span>
        </button>
        <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <ul className='nav align-items-center'>
            <li className='navitem'>
              <NavLink
                to='/'
                className={({ isActive }) =>
                  `navlink ${
                    isActive && window.location.pathname ? 'active' : ''
                  }`
                }
                onClick={toggleMenu}
              >
                Home
              </NavLink>
            </li>
            <li className='navitem'>
              <NavLink
                to='/insurances'
                className={({ isActive }) =>
                  `navlink ${isActive ? 'active' : ''}`
                }
                onClick={toggleMenu}
              >
                Insurances
              </NavLink>
            </li>
            <li className='navitem'>
              <NavLink
                to='/hospitals'
                className={({ isActive }) =>
                  `navlink ${isActive ? 'active' : ''}`
                }
                onClick={toggleMenu}
              >
                Hospitals
              </NavLink>
            </li>
            <li className='navitem'>
              <NavLink
                to='/appointment'
                className={({ isActive }) =>
                  `navlink ${isActive ? 'active' : ''}`
                }
                onClick={toggleMenu}
              >
                Appointment
              </NavLink>
            </li>
            <li className='navitem'>
              {isLoggedIn ? (
                <Link to={`/${user.type}/profile`}>
                  <img
                    src={user.data.image}
                    alt='profile pic'
                    className='profile-image'
                  />
                </Link>
              ) : (
                <Link
                  to='/get-started'
                  className='nav-button'
                  onClick={toggleMenu}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
