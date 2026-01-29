import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { UserContext } from '../../../store/user-context';
import { isImageValid, capitalize, formatDate } from '../../../helpers/helper';
import { apiUrl } from '../../../config/api';

import { Card, Button, Tabs, Tab, Modal } from 'react-bootstrap';
import CoverImg from '../../../assets/images/unsplash_0aMMMUjiiEQ.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCalendar,
  faLocationDot,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const [key, setKey] = useState('healthRecords');
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [newRecordData, setNewRecordData] = useState({
    date: '',
    description: '',
    image: null,
  });
  const [healthRecords, setHealthRecords] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const { logout, user } = useContext(UserContext);

  useEffect(() => {
    const healthRecordsData = user.data.medical_records;
    setHealthRecords(healthRecordsData);
  }, [user.data.medical_records]);

  useEffect(() => {
    const fetchUpdates = async () => {
      const token = localStorage.getItem('auth-token');
      const userId = localStorage.getItem('user-id');

      const response = await fetch(apiUrl('/insurer/get-user-appointments'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      const resData = await response.json();
      setUpdates(resData.appointments);
    };
    fetchUpdates();
  }, []);

  const handleAddRecord = e => {
    setShowAddRecordModal(true);
  };

  const handleCloseModal = () => {
    setShowAddRecordModal(false);
    setNewRecordData({
      date: '',
      description: '',
      image: null,
    });
  };

  const handleChange = (e, data) => {
    setNewRecordData(prevData => ({
      ...prevData,
      [e.target.name]: data,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!isImageValid(newRecordData.image.type)) {
      setError('File must be in JPG/PNG format');
      return;
    }

    const imgExtension = newRecordData.image.type.split('/')[1];

    const { url } = await fetch(apiUrl('/s3url'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imgExtension }),
    }).then(res => res.json());

    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: newRecordData.image,
    });

    const imageUrl = url.split('?')[0];

    const newHealthRecord = {
      user_id: user.data._id,
      date: newRecordData.date,
      image: imageUrl,
      description: newRecordData.description,
    };

    const token = localStorage.getItem('auth-token');

    const response = await fetch(apiUrl('/customer/profile/medical_records'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'auth-token': `${token}`,
      },
      body: JSON.stringify(newHealthRecord),
    });

    const resData = await response.json();

    console.log(resData);

    setHealthRecords([...healthRecords, resData]);
    setShowAddRecordModal(false);
  };

  const handleAppointmentBtn = e => {
    e.preventDefault();
    navigate('/appointment');
  };

  return (
    <div className='container profile-page'>
      <div className='header-section'>
        <div className='cover-image'>
          <img src={CoverImg} alt='Cover' className='cover-img' />
        </div>

        <div className='profile-pic'>
          <img src={user.data.image} alt='Profile' className='profile-img' />
        </div>
      </div>

      <div className='profile-info'>
        <h2 className='profile-name'>{user.data.name}</h2>
        <div className='action-buttons'>
          <Button variant='primary' onClick={handleAddRecord}>
            Add Health Record
          </Button>
          <Button variant='primary' onClick={handleAppointmentBtn}>
            Book an Appointment
          </Button>
          <Button
            variant='danger'
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className='row body-section'>
        <div className='col-md-3 about-section'>
          <Card>
            <Card.Body>
              <Card.Title>About</Card.Title>
              <div className='about-info'>
                <div className='icon-text'>
                  <FontAwesomeIcon icon={faUser} className='icon' />
                  <p>{capitalize(user.data.gender)}</p>
                </div>
                <div className='icon-text'>
                  <FontAwesomeIcon icon={faCalendar} className='icon' />
                  <p>Born {formatDate(user.data.dob)}</p>
                </div>
                <div className='icon-text'>
                  <FontAwesomeIcon icon={faLocationDot} className='icon' />
                  <p>
                    {capitalize(user.data.city)}, {capitalize(user.data.state)}
                  </p>
                </div>
                <div className='icon-text'>
                  <FontAwesomeIcon icon={faEnvelope} className='icon' />
                  <p>{user.data.email}</p>
                </div>
                <div className='icon-text'>
                  <FontAwesomeIcon icon={faPhone} className='icon' />
                  <p>{user.data.contactNo}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className='toggle-section'>
          <Tabs activeKey={key} onSelect={k => setKey(k)} className='mb-3'>
            <Tab eventKey='healthRecords' title='Health Records'>
              <div className='health-records'>
                {healthRecords &&
                  healthRecords.map((record, index) => (
                    <Card key={index} className='mb-3'>
                      <Card.Body>
                        <Card.Title>{record.date}</Card.Title>
                        <img
                          src={record.image}
                          alt='Record'
                          className='record-img'
                        />
                        <p>{record.description}</p>
                      </Card.Body>
                    </Card>
                  ))}
              </div>
            </Tab>

            <Tab eventKey='updates' title='Appointments'>
              <div className='updates'>
                {updates &&
                  updates.map(update => (
                    <div className='update-item' key={update._id}>
                      <img
                        src={update.counsellor_image}
                        alt={update.counsellor_name}
                        className='update-img'
                      />
                      <div className='update-info'>
                        <h5>{update.counsellor_name}</h5>
                        <p>{update.status}</p>
                      </div>
                      <span className='update-time'>
                        {formatDate(update.updatedAt)}
                      </span>
                    </div>
                  ))}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>

      <Modal show={showAddRecordModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Health Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className='mb-3'>
              <label htmlFor='date' className='form-label'>
                Date
              </label>
              <input
                type='date'
                className='form-control'
                id='date'
                name='date'
                value={newRecordData.date}
                onChange={e => handleChange(e, e.target.value)}
                required
              />
            </div>
            <div className='mb-3'>
              <label htmlFor='description' className='form-label'>
                Description
              </label>
              <textarea
                className='form-control'
                id='description'
                name='description'
                value={newRecordData.description}
                onChange={e => handleChange(e, e.target.value)}
                required
              ></textarea>
            </div>
            <div className='mb-3'>
              <label htmlFor='image' className='form-label'>
                Image
              </label>
              <input
                type='file'
                id='image'
                name='image'
                accept='.png, .jpg, .jpeg'
                onChange={e => handleChange(e, e.target.files[0])}
              />
            </div>
            <button type='submit' className='btn btn-primary'>
              Add Record
            </button>
            {error && <p>{error}</p>}
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserProfilePage;
