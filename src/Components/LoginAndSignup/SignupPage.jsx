import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './LoginAndSignupPage.css';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = location.state || { role: 'customer' };

  const submitHandler = async e => {
    e.preventDefault();

    if (
      !name ||
      name.trim().length === 0 ||
      !email ||
      !email.includes('@') ||
      !password ||
      password.trim().length < 8 ||
      confirmPassword !== password
    )
      return;

    let userData, response, resData;

    switch (role) {
      case 'customer':
        if (
          !dob ||
          dob.trim().length === 0 ||
          !city ||
          city.trim().length === 0 ||
          !state ||
          state.trim().length === 0
        )
          return;

        userData = {
          name,
          dob,
          city,
          state,
          email,
          password,
        };

        response = await fetch('http://localhost:4000/user/signup/', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) return;

        resData = await response.json();
        localStorage.setItem('auth-token', resData.token);
        // window.location.replace('/');
        console.log(resData.user);

        break;

      case 'hospital':
        if (
          !city ||
          city.trim().length === 0 ||
          !state ||
          state.trim().length === 0
        )
          return;

        userData = {
          hospital_name: name,
          city,
          state,
          email,
          password,
        };

        response = await fetch('http://localhost:4000/hospital/signup/', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) return;

        resData = await response.json();
        localStorage.setItem('auth-token', resData.token);
        // window.location.replace('/');
        console.log(resData.hospital);

        break;

      case 'company':
        userData = {
          company_name: name,
          email,
          password,
        };
        response = await fetch('http://localhost:4000/company/signup/', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status !== 200) return;

        resData = await response.json();
        localStorage.setItem('auth-token', resData.token);
        // window.location.replace('/');
        console.log(resData.company);

        break;

      default:
        break;
    }
  };

  return (
    <div className='signup-page-container'>
      <h2 className='heading2'>
        Signup as{' '}
        {role === 'customer'
          ? 'Customer'
          : role === 'hospital'
          ? 'Hospital Authority'
          : 'Insurance Company Authority'}
      </h2>
      {/* Signup form */}
      <form className='signup-form' onSubmit={submitHandler}>
        <label htmlFor='name'>Name</label>
        <input
          type='text'
          id='name'
          name='name'
          required
          value={name}
          onChange={e => {
            setName(e.target.value);
          }}
        />

        {role === 'customer' && (
          <>
            <label htmlFor='dob'>Date of Birth</label>
            <input
              type='date'
              id='dob'
              name='dob'
              required
              value={dob}
              onChange={e => {
                setDob(e.target.value);
              }}
            />
          </>
        )}

        {role !== 'company' && (
          <>
            <label htmlFor='city'>City</label>
            <input
              type='text'
              id='city'
              name='city'
              required
              value={city}
              onChange={e => {
                setCity(e.target.value);
              }}
            />

            <label htmlFor='state'>State</label>
            <input
              type='text'
              id='state'
              name='state'
              required
              value={state}
              onChange={e => {
                setState(e.target.value);
              }}
            />
          </>
        )}

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

        <label htmlFor='confirmPassword'>Confirm Password</label>
        <input
          type='password'
          id='confirmPassword'
          name='confirmPassword'
          required
          value={confirmPassword}
          onChange={e => {
            setConfirmPassword(e.target.value);
          }}
        />

        <button type='submit' className='signup-btn'>
          Signup
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <span
          onClick={() => {
            navigate('/login', { state: { role } });
          }}
        >
          Login here
        </span>
      </p>{' '}
      {/* Link to login page */}
    </div>
  );
};

export default SignupPage;
