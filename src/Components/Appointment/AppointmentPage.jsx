import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { apiUrl } from '../../config/api';
import insurerIcon from '../../assets/icons/insurer.svg';
import downArrowIcon from '../../assets/icons/down-arrow.svg';
import callIcon from '../../assets/icons/call-icon.svg';
import emailIcon from '../../assets/icons/email-icon.svg';
import tickIcon from '../../assets/icons/tick-icon.svg';

import './AppointmentPage.css';

const AppointmentPage = () => {
  const [showBookAppointmentModal, setShowBookAppointmentModal] =
    useState(false);
  const [insurers, setInsurers] = useState([]);
  const [insurersFilter, setInsurersFilter] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [todayDate, setTodayDate] = useState('');

  const [isInsurerDropdownOpen, setIsInsurerDropdownOpen] = useState(false);

  const [appointmentData, setAppointmentData] = useState({
    date: '',
    company_id: '',
    counsellor_name: '',
    counsellor_image: '',
    time: '',
    timeSlot: '',
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayDate(today);
  }, []);

  useEffect(() => {
    const fetchCounsellors = async () => {
      const token = localStorage.getItem('auth-token');

      const response = await fetch(apiUrl('/customer/get-counsellors'), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
      });

      const resData = await response.json();
      console.log(resData.counsellors);

      const insurersData = [
        ...new Set(resData.counsellors.map(counsellor => counsellor.insurer)),
      ];

      setInsurers(insurersData);
      setCounsellors(resData.counsellors || []);
      setFilteredData(resData.counsellors || []);
    };
    fetchCounsellors();
  }, []);

  const bookAppointmentHandler = async e => {
    e.preventDefault();

    const token = localStorage.getItem('auth-token');
    const userId = localStorage.getItem('user-id');

    await fetch(apiUrl('/customer/book-appointment'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'auth-token': `${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        date: appointmentData.date,
        timing: appointmentData.time,
        company_id: appointmentData.company_id,
        counsellor_name: appointmentData.counsellor_name,
        counsellor_image: appointmentData.counsellor_image,
      }),
    });

    handleCloseAppointmentModal();
  };

  const handleBookAppointment = (
    company_id,
    counsellor_name,
    counsellor_image
  ) => {
    setAppointmentData(prevData => ({
      ...prevData,
      company_id,
      counsellor_name,
      counsellor_image,
    }));
    setShowBookAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowBookAppointmentModal(false);
    setAppointmentData({ date: '', time: '', timeSlot: '' });
  };

  const handleAppointmentChange = e => {
    const { name, value } = e.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  const handleTimeSlotChange = e => {
    const selectedSlot = e.target.value;
    setAppointmentData({
      ...appointmentData,
      timeSlot: selectedSlot,
      time: '',
    });
  };

  const handleInsurerChange = insurer => {
    const selectedInsurers = insurersFilter.includes(insurer)
      ? insurersFilter.filter(item => item !== insurer)
      : [...insurersFilter, insurer];
    setInsurersFilter(selectedInsurers);
  };

  const applyFilters = () => {
    setIsInsurerDropdownOpen(false);

    let data = counsellors;

    if (insurersFilter.length > 0) {
      data = data.filter(item => insurersFilter.includes(item.insurer));
    }

    setFilteredData(data);
  };

  return (
    <div className='appointment-page-container'>
      <div className='filters-container'>
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
                    checked={insurersFilter.includes(insurer)}
                    onChange={() => handleInsurerChange(insurer)}
                  />
                  {insurer}
                </label>
              ))}
            </div>
          )}
        </div>

        <button className='apply-filters-btn' onClick={applyFilters}>
          Apply Filters
        </button>
      </div>
      <div className='counsellor-cards-container'>
        {filteredData.map((counsellor, index) => (
          <div key={index} className='counsellor-card'>
            <img
              src={counsellor.company_logo}
              alt={counsellor.insurer}
              className='c-insurer-logo'
            />
            <img
              src={counsellor.image}
              alt={counsellor.name}
              className='counsellor-image'
            />
            <h3>{counsellor.name}</h3>
            <p>
              <img src={callIcon} alt='call icon' width={17} />
              {counsellor.phone_no}
            </p>
            <p>
              <img src={emailIcon} alt='email icon' width={19} />
              {counsellor.email}
            </p>
            <ul className='key-points'>
              {counsellor.tags.map((tag, idx) => (
                <li key={idx}>
                  <img src={tickIcon} alt='tict icon' width={16} /> {tag}
                </li>
              ))}
            </ul>
            <button
              className='view-details-btn'
              onClick={() => {
                handleBookAppointment(
                  counsellor.company_id,
                  counsellor.name,
                  counsellor.image
                );
              }}
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      <Modal
        show={showBookAppointmentModal}
        onHide={handleCloseAppointmentModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Book an Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={bookAppointmentHandler}>
            <div className='mb-3'>
              <label htmlFor='date' className='form-label'>
                Date
              </label>
              <input
                type='date'
                className='form-control'
                id='date'
                name='date'
                value={appointmentData.date}
                onChange={handleAppointmentChange}
                min={todayDate}
                required
              />
            </div>

            <div className='mb-3'>
              <label htmlFor='timeSlot' className='form-label'>
                Time Slot
              </label>
              <select
                className='form-control'
                id='timeSlot'
                name='timeSlot'
                value={appointmentData.timeSlot}
                onChange={handleTimeSlotChange}
                required
              >
                <option value=''>Select Time Slot</option>
                <option value='morning'>Morning</option>
                <option value='evening'>Evening</option>
                <option value='night'>Night</option>
              </select>
            </div>

            {appointmentData.timeSlot && (
              <div className='mb-3'>
                <label htmlFor='time' className='form-label'>
                  Available Time
                </label>
                <select
                  className='form-control'
                  id='time'
                  name='time'
                  value={appointmentData.time}
                  onChange={handleAppointmentChange}
                  required
                >
                  <option value=''>Select Time</option>
                  {appointmentData.timeSlot === 'morning' && (
                    <>
                      <option value='8:00 AM'>8:00 AM</option>
                      <option value='9:00 AM'>9:00 AM</option>
                      <option value='10:00 AM'>10:00 AM</option>
                      <option value='11:00 AM'>11:00 AM</option>
                    </>
                  )}
                  {appointmentData.timeSlot === 'evening' && (
                    <>
                      <option value='4:00 PM'>4:00 PM</option>
                      <option value='5:00 PM'>5:00 PM</option>
                      <option value='6:00 PM'>6:00 PM</option>
                      <option value='7:00 PM'>7:00 PM</option>
                    </>
                  )}
                  {appointmentData.timeSlot === 'night' && (
                    <>
                      <option value='8:00 PM'>8:00 PM</option>
                      <option value='9:00 PM'>9:00 PM</option>
                      <option value='10:00 PM'>10:00 PM</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <Button type='submit' className='btn btn-primary'>
              Submit
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AppointmentPage;
