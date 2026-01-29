import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import { UserContext } from '../../store/user-context';
import { apiUrl } from '../../config/api';

import 'react-phone-input-2/lib/style.css';
import './LoginAndSignupPage.css';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(UserContext);
  const { role } = location.state || { role: 'customer' };

  const submitHandler = async e => {
    e.preventDefault();
    setErrorMessage('');

    if (
      !name ||
      name.trim().length === 0 ||
      !image ||
      !contactNo ||
      !email ||
      !email.includes('@') ||
      !password ||
      password.trim().length < 8 ||
      confirmPassword !== password
    ) {
      setErrorMessage('Please fill all required fields correctly.');
      return;
    }

    const imgExtension = image.type.split('/')[1];

    const { url } = await fetch(apiUrl('/s3url'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imgExtension }),
    }).then(res => res.json());

    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: image,
    });

    const imageUrl = url.split('?')[0];

    let userData, response, resData;

    switch (role) {
      case 'customer':
        if (
          !gender ||
          !dob ||
          dob.trim().length === 0 ||
          !city ||
          city.trim().length === 0 ||
          !state ||
          state.trim().length === 0
        ){
          setErrorMessage('Please fill all required fields.');
          return;
        }

        if (!/^[a-zA-Z ]+$/.test(city)) {
          setErrorMessage('Please enter a valid city name.');
          return;
        }
        if (!/^[a-zA-Z ]+$/.test(state)) {
          setErrorMessage('Please enter a valid state name.');
          return;
        }


        userData = {
          name,
          image: imageUrl,
          gender,
          dob,
          city: city.toLowerCase(),
          state: state.toLowerCase(),
          contactNo,
          email,
          password,
        };

        // console.log(userData);

        response = await fetch(apiUrl('/customer/signup'), {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 400) {
          setErrorMessage('Invalid input. Please check your details.');
          return;
        }
        if (response.status === 403) {
          setErrorMessage('User already exists.');
          return;
        }
        if (response.status !== 200) {
          setErrorMessage('Something went wrong. Please try again later.');
          return;
        }

        resData = await response.json();
        console.log(resData.user);
        login(resData.token, role, resData.user);
        navigate('/customer/profile');

        break;

      case 'hospital':
        if (!city || city.trim().length === 0 || !state || state.trim().length === 0) {
          setErrorMessage('Please fill all required fields.');
          return;
        }

        userData = {
          hospital_name: name.toLowerCase(),
          image: imageUrl,
          contactNo,
          city: city.toLowerCase(),
          state: state.toLowerCase(),
          email,
          password,
        };

        response = await fetch(apiUrl('/hospital/signup'), {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 400) {
          setErrorMessage('Invalid input. Please check your details.');
          return;
        }
        if (response.status === 403) {
          setErrorMessage('Hospital already exists.');
          return;
        }
        if (response.status !== 200) {
          setErrorMessage('Something went wrong. Please try again later.');
          return;
        }

        resData = await response.json();
        login(resData.token, role, resData.hospital);
        window.location.replace('/');

        break;

      case 'insurer':
        userData = {
          company_name: name.toLowerCase(),
          image: imageUrl,
          city,
          state,
          contactNo,
          email,
          password,
        };
        response = await fetch(apiUrl('/insurer/signup'), {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 400) {
          setErrorMessage('Invalid input. Please check your details.');
          return;
        }
        if (response.status === 403) {
          setErrorMessage('Company already exists.');
          return;
        }
        if (response.status !== 200) {
          setErrorMessage('Something went wrong. Please try again later.');
          return;
        }

        resData = await response.json();
        login(resData.token, role, resData.company);
        window.location.replace('/');

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

      {errorMessage && <p className='error-message'>{errorMessage}</p>}


      <form className='signup-form' onSubmit={submitHandler}>
        <label htmlFor='name'>
          {role === 'customer'
            ? 'Name'
            : role === 'hospital'
            ? 'Hospital Name'
            : 'Company Name'}
        </label>
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

        <label htmlFor='image'>Profile Image</label>
        <input
          type='file'
          id='image'
          name='image'
          accept='.png, .jpg, .jpeg'
          onChange={e => setImage(e.target.files[0])}
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
            <label htmlFor='gender'>Gender</label>
            <select
              id='gender'
              value={gender}
              onChange={e => {
                setGender(e.target.value);
              }}
              required
            >
              <option value='' disabled>
                Select your gender
              </option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </select>
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
        <label htmlFor='contact-no'>Contact No</label>
        <PhoneInput
          country={'in'}
          enableSearch={true}
          disableDropdown={false}
          value={contactNo}
          onChange={phone => setContactNo(phone)}
          inputProps={{
            id: 'contact-no',
            name: 'contact-no',
            required: true,
          }}
        />
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
      </p>
    </div>
  );
};

export default SignupPage;
