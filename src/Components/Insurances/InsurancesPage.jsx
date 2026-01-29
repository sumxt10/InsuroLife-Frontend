import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiUrl } from '../../config/api';

import insurerIcon from '../../assets/icons/insurer.svg';
import claimIcon from '../../assets/icons/claim.svg';
import premiumIcon from '../../assets/icons/money-bag.svg';
// import sortIcon from '../../assets/icons/sort-icon.svg';
import downArrowIcon from '../../assets/icons/down-arrow.svg';

import './InsurancesPage.css';

const InsurancesPage = () => {
  const [filters, setFilters] = useState({
    insurers: [],
    claim: '',
    premium: '',
  });
  const [sortOption, setSortOption] = useState({ field: '', order: '' });
  const [insurances, setInsurances] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [isInsurerDropdownOpen, setIsInsurerDropdownOpen] = useState(false);
  const [isClaimDropdownOpen, setIsClaimDropdownOpen] = useState(false);
  const [isPremiumDropdownOpen, setIsPremiumDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const insurers = [...new Set(insurances.map(insurance => insurance.insurer))];
  const claimOptions = ['300000', '500000', '1000000']; // Predefined claim options
  const premiumOptions = ['500', '800', '1500']; // Predefined premium options

  // Handle insurer filter
  const handleInsurerChange = insurer => {
    const selectedInsurers = filters.insurers.includes(insurer)
      ? filters.insurers.filter(item => item !== insurer)
      : [...filters.insurers, insurer];
    setFilters({ ...filters, insurers: selectedInsurers });
  };

  useEffect(() => {
    const fetchInsurances = async () => {
      const token = localStorage.getItem('auth-token');

      const response = await fetch(apiUrl('/customer/get-insurances'), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
      });

      const resData = await response.json();
      console.log(resData);
      setInsurances(resData);
      setFilteredData(resData);
    };
    fetchInsurances();
  }, []);

  // Handle claim and premium filters
  const handleOtherFilterChange = e => {
    if (filters[e.target.name] === e.target.value) {
      setFilters({ ...filters, [e.target.name]: '' });
    } else setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Apply filters and sorting
  const applyFilters = () => {
    setIsInsurerDropdownOpen(false);
    setIsClaimDropdownOpen(false);
    setIsPremiumDropdownOpen(false);
    setIsSortDropdownOpen(false);

    let data = insurances;

    if (filters.insurers.length > 0) {
      data = data.filter(item => filters.insurers.includes(item.insurer));
    }

    if (filters.claim) {
      data = data.filter(item => item.claim <= parseInt(filters.claim));
    }

    if (filters.premium) {
      data = data.filter(item => item.premium <= parseInt(filters.premium));
    }

    if (sortOption.field) {
      data = data.sort((a, b) => {
        if (sortOption.order === 'asc') {
          return a[sortOption.field] - b[sortOption.field];
        } else {
          return b[sortOption.field] - a[sortOption.field];
        }
      });
    }
    setFilteredData(data);
  };

  // Handle sort change
  const handleSortChange = field => {
    const newOrder = sortOption.order === 'asc' ? 'desc' : 'asc';
    setSortOption({ field, order: newOrder });
  };

  return (
    <div className='insurance-page-container'>
      <div className='filters-container'>
        {/* Insurer Dropdown */}
        <div className='dropdown'>
          <button
            className='dropdown-btn'
            onClick={() => setIsInsurerDropdownOpen(!isInsurerDropdownOpen)}
          >
            <img src={insurerIcon} width={20} alt='insurer icon' />
            Insurer
            <img src={downArrowIcon} width={20} alt='down arrow' />
          </button>
          {isInsurerDropdownOpen && (
            <div className='dropdown-content'>
              {insurers.map(insurer => (
                <label key={insurer} className='checkbox-label'>
                  <input
                    type='checkbox'
                    value={insurer}
                    checked={filters.insurers.includes(insurer)}
                    onChange={() => handleInsurerChange(insurer)}
                  />
                  {insurer}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Claim Filter */}
        <div className='dropdown'>
          <button
            className='dropdown-btn'
            onClick={() => setIsClaimDropdownOpen(!isClaimDropdownOpen)}
          >
            <img src={claimIcon} width={20} alt='claim icon' />
            Claim
            <img src={downArrowIcon} width={20} alt='down arrow' />
          </button>
          {isClaimDropdownOpen && (
            <div className='dropdown-content'>
              {claimOptions.map(claim => (
                <label key={claim} className='checkbox-label'>
                  <input
                    type='checkbox'
                    value={claim}
                    checked={filters.claim === claim}
                    name='claim'
                    onChange={handleOtherFilterChange}
                  />
                  Up to ₹{claim}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Premium Filter */}
        <div className='dropdown'>
          <button
            className='dropdown-btn'
            onClick={() => setIsPremiumDropdownOpen(!isPremiumDropdownOpen)}
          >
            <img src={premiumIcon} width={20} alt='premium icon' />
            Premium
            <img src={downArrowIcon} width={20} alt='down arrow' />
          </button>
          {isPremiumDropdownOpen && (
            <div className='dropdown-content'>
              {premiumOptions.map(premium => (
                <label key={premium} className='checkbox-label'>
                  <input
                    type='checkbox'
                    value={premium}
                    checked={filters.premium === premium}
                    name='premium'
                    onChange={handleOtherFilterChange}
                  />
                  Up to ₹{premium}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className='dropdown'>
          <button
            className='dropdown-btn'
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          >
            Sort by
            <img src={downArrowIcon} width={20} alt='down arrow' />
          </button>
          {isSortDropdownOpen && (
            <div className='dropdown-content'>
              <button onClick={() => handleSortChange('claim')}>
                Claim{' '}
                {sortOption.field === 'claim' &&
                  (sortOption.order === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSortChange('premium')}>
                Premium{' '}
                {sortOption.field === 'premium' &&
                  (sortOption.order === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          )}
        </div>

        {/* Apply Filters Button */}
        <button className='apply-filters-btn' onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      {/* Insurance Cards */}
      <div className='insurance-cards-container'>
        {filteredData.map((insurance, index) => (
          <div key={index} className='insurance-card'>
            <img
              src={insurance.logo}
              alt={insurance.insurer}
              className='insurer-logo'
            />
            <h3>{insurance.insurance_name}</h3>
            {/* <p className='insurance-insurer'>{insurance.insurer}</p> */}
            <p>
              Claim: <span>₹{insurance.claim}</span>
            </p>
            <p>
              Premium: <span>₹{insurance.premium}/month</span>
            </p>
            <ul className='key-points'>
              {insurance.tags.map((tag, idx) => (
                <li key={idx}>★ {tag}</li>
              ))}
            </ul>
            <button
              className='view-details-btn'
              onClick={() => {
                navigate(`/insurances/${insurance._id}`);
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

export default InsurancesPage;
