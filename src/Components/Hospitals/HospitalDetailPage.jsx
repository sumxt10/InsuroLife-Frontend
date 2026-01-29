import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { capitalize } from '../../helpers/helper';
import { apiUrl } from '../../config/api';

import bajajLogo from '../../assets/insurance-images/bajaj-logo.png';
import starIcon from '../../assets/icons/star-fill-icon.svg';
import './HospitalDetailPage.css';

// Sample hospital data

const insurances = [
  {
    insuranceName: 'Health Shield Plan',
    insurerLogo: bajajLogo, // Placeholder image for insurer logo
  },
  {
    insuranceName: 'Star Plan',
    insurerLogo: bajajLogo, // Placeholder image for insurer logo
  },
];

const HospitalDetailPage = () => {
  const { hospital_id } = useParams(); // Extract hospital_id from URL
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const fetchHospital = async () => {
      const token = localStorage.getItem('auth-token');

      const response = await fetch(apiUrl('/customer/get-hospital'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
        body: JSON.stringify({ hospital_id }),
      });

      const resData = await response.json();
      console.log(resData);
      setHospital(resData);
    };
    fetchHospital();
  }, [hospital_id]);

  if (!hospital) {
    return <div>Loading...</div>;
  }

  return (
    <div className='hospital-detail-page'>
      <div className='d-hospital-info'>
        <img
          src={hospital.image}
          alt={hospital.hospital_name}
          className='h-hospital-image'
        />
        <h2>{capitalize(hospital.hospital_name)}</h2>
        <p className='d-point'>
          City: <span>{capitalize(hospital.city)}</span>
        </p>
        <p className='d-point'>
          State: <span>{capitalize(hospital.state)}</span>
        </p>

        <p className='star-rating d-point'>
          Rating: {hospital.avgRating}
          <img src={starIcon} alt='star icon' width={16} />
        </p>
        <p className='d-point'>
          Contact No: <span>{hospital.contactNo}</span>
        </p>
        <p className='d-point'>
          Email Id: <span>{hospital.email}</span>
        </p>
      </div>

      <div className='d-insurance-list'>
        <h3 className='ctr'>Insurances that can be use in our Hospital</h3>
        <div className='d-insurance-cards-container'>
          {insurances.map((insurance, index) => (
            <div key={index} className='d-insurance-card'>
              <img
                src={insurance.insurerLogo}
                alt={insurance.insuranceName}
                className='d-insurance-image'
              />
              <h4 className='d-insurance-name'>{insurance.insuranceName}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HospitalDetailPage;
