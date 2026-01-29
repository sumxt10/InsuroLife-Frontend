import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { capitalize } from '../../helpers/helper';
import { apiUrl } from '../../config/api';

import hospitalImage from '../../assets/hospital-images/hospital-image.jpg';
import './InsuranceDetailPage.css';

// Sample insurance data
const hospitals = [
  {
    hospital_name: 'City Hospital',
    image: hospitalImage,
  },
  {
    hospital_name: 'Global Hospital',
    image: hospitalImage,
  },
];

const InsuranceDetailPage = () => {
  const { insurance_id } = useParams(); // Extract insurance_id from URL
  const [insurance, setInsurance] = useState(null);

  useEffect(() => {
    const fetchInsurance = async () => {
      const token = localStorage.getItem('auth-token');

      const response = await fetch(apiUrl('/customer/get-insurance'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
        body: JSON.stringify({ insurance_id }),
      });

      const resData = await response.json();
      console.log(resData);
      setInsurance(resData);
    };
    fetchInsurance();
  }, [insurance_id]);

  if (!insurance) {
    return <div>Loading...</div>;
  }

  return (
    <div className='insurance-detail-page'>
      <div className='d-insurance-info'>
        <img
          src={insurance.logo}
          alt={insurance.insurer}
          className='d-insurer-logo'
        />
        <h2>{capitalize(insurance.insurance_name)}</h2>
        <p className='d-point'>
          Insurer: <span>{capitalize(insurance.insurer)}</span>
        </p>
        <p className='d-point'>
          Claim: <span>₹{insurance.claim}</span>
        </p>
        <p className='d-point'>
          Premium: <span>₹{insurance.premium}/month</span>
        </p>
        <ul className='d-key-points'>
          {insurance.tags.map((tag, index) => (
            <li key={index}>{tag}</li>
          ))}
        </ul>
        <p className='d-insurance-details'>{insurance.description}</p>
      </div>

      <div className='d-hospital-list'>
        <h3 className='ctr'>Hospitals Where This Insurance Can Be Used</h3>
        <div className='d-hospital-cards-container'>
          {hospitals.map((hospital, index) => (
            <div key={index} className='d-hospital-card'>
              <img
                src={hospital.image}
                alt={hospital.hospital_name}
                className='d-hospital-image'
              />
              <h4 className='d-hospital-name'>{hospital.hospital_name}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetailPage;
