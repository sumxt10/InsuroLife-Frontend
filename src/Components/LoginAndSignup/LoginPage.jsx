import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './LoginAndSignupPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { role } = location.state || { role: 'customer' };

  const submitHandler = async e => {
    e.preventDefault();

    if (
      !email ||
      !email.includes('@') ||
      !password ||
      password.trim().length < 8
    )
      return;

    const userData = { email, password };
    let response, resData;

    switch (role) {
      case 'customer':
        response = await fetch('/user/login/', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) return;

        resData = await response.json();
        localStorage.setItem('auth-token', resData.token);
        window.location.replace('/user/profile');
        // console.log(resData.user);

        break;

      case 'hospital':
        response = await fetch('/hospital/login/', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) return;

        resData = await response.json();
        localStorage.setItem('auth-token', resData.token);
        window.location.replace('/hospital/profile');
        // console.log(resData.hospital);

        break;

      case 'insurer':
        response = await fetch('/insurer/login/', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) return;

        resData = await response.json();
        localStorage.setItem('auth-token', resData.token);
        window.location.replace('/insurer/profile');
        // console.log(resData.insurer);

        break;

      default:
        break;
    }
  };

  return (
    <div className='login-page-container'>
      <h2 className='heading2'>
        Login as{' '}
        {role === 'customer'
          ? 'Customer'
          : role === 'hospital'
          ? 'Hospital Authority'
          : 'Insurance Company Authority'}
      </h2>
      {/* Login form */}
      <form className='login-form' onSubmit={submitHandler}>
        <label htmlFor='email'>Email</label>
        <input
          type='email'
          id='email'
          name='email'
          required
          value={email}
          onChange={e => {
            setEmail(e.target.value);
          }}
        />

        <label htmlFor='password'>Password</label>
        <input
          type='password'
          id='password'
          name='password'
          required
          value={password}
          onChange={e => {
            setPassword(e.target.value);
          }}
        />

        <button type='submit' className='login-btn'>
          Login
        </button>
      </form>
      <p>
        Don't have an account?{' '}
        <span
          onClick={() => {
            navigate('/signup', { state: { role } });
          }}
        >
          Signup here
        </span>
      </p>
    </div>
  );
};

export default LoginPage;
