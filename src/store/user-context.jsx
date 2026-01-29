import { createContext, useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
const initialState = {
  type: '',
  data: {},
};

export const UserContext = createContext({
  user: initialState,
  isLoggedIn: false,
  login: (token, userType, userData) => {},
  logout: () => {},
});

const UserProvider = props => {
  const [user, setUser] = useState(initialState);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (token, userType, userData) => {
    setUser({ type: userType, data: userData });
    setIsLoggedIn(true);
    localStorage.setItem('auth-token', token);
    localStorage.setItem('user-type', userType);
    localStorage.setItem('user-id', userData._id);
  };

  const logout = () => {
    setUser(initialState);
    setIsLoggedIn(false);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-type');
    localStorage.removeItem('user-id');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const role = localStorage.getItem('user-type');
      const id = localStorage.getItem('user-id');
      if (!role) return;
      const response = await fetch(apiUrl('/user'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, id }),
      });

      const userData = await response.json();
      setUser({ type: role, data: userData });
      setIsLoggedIn(true);
    };
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
