import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// import { UserContext } from '../../store/user-context';
import { capitalize } from '../../helpers/helper';
import { apiUrl } from '../../config/api';

import downArrowIcon from '../../assets/icons/down-arrow.svg';
import locationIcon from '../../assets/icons/location.svg';
import starIcon from '../../assets/icons/star-fill-icon.svg';

import './HospitalsPage.css';

const HospitalsPage = () => {
  // const { user } = useContext(UserContext);
  const [state, setState] = useState('maharashtra');
  const [city, setCity] = useState('');

  const [filteredData, setFilteredData] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const stateOptions = [...new Set(hospitals.map(hospital => hospital.state))];
  const cityOptions = [
    ...new Set(
      hospitals
        .filter(hospital => hospital.state === state)
        .map(hospital => hospital.city)
    ),
  ];

  useEffect(() => {
    const fetchHospitals = async () => {
      const token = localStorage.getItem('auth-token');

      const response = await fetch(apiUrl('/customer/get-hospitals'), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
      });

      const resData = await response.json();
      console.log(resData);
      setHospitals(resData);
      setFilteredData(resData);
    };
    fetchHospitals();
  }, [state]);

  const stateChangeHandler = e => {
    setState(e.target.value);
  };

  const cityChangeHandler = e => {
    setCity(prevCity => (prevCity === e.target.value ? '' : e.target.value));
  };

  // Apply filters and sorting
  const applyFilters = () => {
    setIsStateDropdownOpen(false);
    setIsCityDropdownOpen(false);

    let data = hospitals;

    if (state) {
      data = data.filter(item => item.state === state);
    }

    if (city) {
      data = data.filter(item => item.city === city);
    }

    setFilteredData(data);
  };

  return (
    <div className='hospital-page-container'>
      <div className='filters-container'>
        {/* State Filter */}
        <div className='dropdown'>
          <button
            className='dropdown-btn'
            onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
          >
            State
            <img src={downArrowIcon} width={20} alt='down arrow' />
          </button>
          {isStateDropdownOpen && (
            <div className='h-dropdown-content'>
              {stateOptions.map(item => (
                <label key={item} className='checkbox-label'>
                  <input
                    type='checkbox'
                    value={item}
                    checked={item === state}
                    name='state'
                    onChange={stateChangeHandler}
                  />
                  {item}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* City Filter */}
        <div className='dropdown'>
          <button
            className='dropdown-btn'
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
          >
            City
            <img src={downArrowIcon} width={20} alt='down arrow' />
          </button>
          {isCityDropdownOpen && (
            <div className='h-dropdown-content'>
              {cityOptions.map(item => (
                <label key={item} className='checkbox-label'>
                  <input
                    type='checkbox'
                    value={item}
                    checked={item === city}
                    name='city'
                    onChange={cityChangeHandler}
                  />
                  {item}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Apply Filters Button */}
        <button className='apply-filters-btn' onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      {/* hospital Cards */}
      <div className='hospital-cards-container'>
        {filteredData.map((hospital, index) => (
          <div key={index} className='hospital-card'>
            <img
              src={hospital.image}
              alt={hospital.hospital_name}
              className='hospital-image'
            />
            <h3>{capitalize(hospital.hospital_name)}</h3>
            <p>
              <img src={locationIcon} alt='location icon' width={20} />
              {capitalize(hospital.city)}, {capitalize(hospital.state)}
            </p>
            <p className='star-rating'>
              {hospital.avgRating}{' '}
              <img src={starIcon} alt='star icon' width={16} />
            </p>
            <button
              className='view-details-btn'
              onClick={() => {
                navigate(`/hospitals/${hospital._id}`);
              }}
            >
              View Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalsPage;
