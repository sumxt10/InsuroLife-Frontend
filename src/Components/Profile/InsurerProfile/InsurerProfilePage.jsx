import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Form, Tabs, Tab } from 'react-bootstrap';

import { UserContext } from '../../../store/user-context';
import { isImageValid, capitalize } from '../../../helpers/helper';
import { apiUrl } from '../../../config/api';

import InsurerCoverImg from '../../../assets/images/insurer-bg.jpeg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import './InsurerProfilePage.css';

function InsurerProfilePage() {
  const [key, setKey] = useState('insurances');
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showCounselorModal, setShowCounselorModal] = useState(false);
  const [insurances, setInsurances] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { logout, user } = useContext(UserContext);

  useEffect(() => {
    const fetchInsurances = async () => {
      const token = localStorage.getItem('auth-token');
      const company_id = localStorage.getItem('user-id');
      const response = await fetch(apiUrl('/insurer/get-insurances'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
        body: JSON.stringify({ company_id }),
      });
      const resData = await response.json();
      setInsurances(resData.insurances || []);
    };

    const fetchCounselors = async () => {
      const token = localStorage.getItem('auth-token');
      const company_id = localStorage.getItem('user-id');
      const response = await fetch(apiUrl('/insurer/get-counsellors'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'auth-token': `${token}`,
        },
        body: JSON.stringify({ company_id }),
      });
      const resData = await response.json();
      setCounselors(resData.counsellors || []);
    };

    fetchInsurances();
    fetchCounselors();
  }, []);

  const handleAddInsurance = async e => {
    e.preventDefault();
    const { insuranceName, claim, premium, tag1, tag2, tag3, description } =
      e.target.elements;

    const newInsurance = {
      company_id: user.data._id,
      insurance_name: insuranceName.value,
      insurer: user.data.company_name,
      logo: user.data.image,
      claim: claim.value,
      premium: premium.value,
      tags: [tag1.value, tag2.value, tag3.value],
      description: description.value,
    };

    const token = localStorage.getItem('auth-token');

    const response = await fetch(apiUrl('/insurer/insurance/new'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'auth-token': `${token}`,
      },
      body: JSON.stringify(newInsurance),
    });
    const resData = await response.json();

    setInsurances([...insurances, resData.insurance]);
    setShowInsuranceModal(false);
  };

  const handleAddCounselor = async e => {
    e.preventDefault();

    if (!isImageValid(e.target.elements.counselorLogo.files[0].type)) {
      setError('File must be in JPG/PNG format');
      return;
    }

    const imgExtension =
      e.target.elements.counselorLogo.files[0].type.split('/')[1];

    const { url } = await fetch(apiUrl('/s3url'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imgExtension }),
    }).then(res => res.json());

    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: e.target.elements.counselorLogo.files[0],
    });

    const imageUrl = url.split('?')[0];

    const newCounselor = {
      insurer: user.data.company_name,
      company_id: user.data._id,
      name: e.target.elements.counselorName.value,
      phone_no: e.target.elements.counselorPhone.value,
      email: e.target.elements.counselorEmail.value,
      company_logo: user.data.image,
      image: imageUrl,
      tags: [
        e.target.elements.counselorTag1.value,
        e.target.elements.counselorTag2.value,
      ],
    };

    const token = localStorage.getItem('auth-token');

    const response = await fetch(apiUrl('/insurer/counsellor'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'auth-token': `${token}`,
      },
      body: JSON.stringify(newCounselor),
    });

    const resData = await response.json();

    setCounselors(prev => [...prev, resData.counsellor]);
    setShowCounselorModal(false);
  };

  return (
    <div className='container profile-page'>
      <div className='header-section'>
        <div className='cover-image'>
          <img src={InsurerCoverImg} alt='Cover' className='cover-img' />
        </div>

        <div className='profile-pic'>
          <img src={user.data.image} alt='Profile' className='profile-img' />
        </div>
      </div>

      <div className='profile-info'>
        <h2 className='profile-name'>{capitalize(user.data.company_name)}</h2>
        <div className='action-buttons'>
          <Button variant='primary' onClick={() => setShowInsuranceModal(true)}>
            Add New Insurance
          </Button>
          <Button variant='primary' onClick={() => setShowCounselorModal(true)}>
            Add Counselor
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

      <div className='profile-info'>
        <div className='col-md-3 about-section'>
          <Card>
            <Card.Body>
              <Card.Title>About</Card.Title>
              <div className='about-info'>
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
        <div className='tab-box'>
          <Tabs
            activeKey={key}
            onSelect={k => setKey(k)}
            className='toggle-section-i'
          >
            <Tab eventKey='insurances' title='Insurances'>
              <div className='insurance-section'>
                {insurances &&
                  insurances.map((insurance, index) => (
                    <Card key={index} className='insurance-card'>
                      <Card.Img variant='top' src={insurance.logo} />
                      <Card.Body>
                        <Card.Title>{insurance.insurance_name}</Card.Title>
                        <Card.Text>Insurer: {insurance.insurer}</Card.Text>
                        <Card.Text>Claim: {insurance.claim}</Card.Text>
                        <Card.Text>
                          Premium: ₹{insurance.premium}/month
                        </Card.Text>
                        <Card.Text>Tags: {insurance.tags.join(', ')}</Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
              </div>
            </Tab>

            <Tab eventKey='counselors' title='Counselors'>
              <div className='counselor-section'>
                {counselors.map((counselor, index) => (
                  <Card key={index} className='counselor-card'>
                    <Card.Img
                      variant='top'
                      src={counselor.image}
                      className='counselor-image'
                    />
                    <Card.Body>
                      <Card.Title>{counselor.name}</Card.Title>
                      <Card.Text>Phone: {counselor.phone_no}</Card.Text>
                      <Card.Text>Email: {counselor.email}</Card.Text>
                      <Card.Text>Tags: {counselor.tags.join(', ')}</Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* Add Insurance Modal */}
      <Modal
        show={showInsuranceModal}
        onHide={() => setShowInsuranceModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Insurance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddInsurance}>
            {/* Form fields for new insurance */}
            <Form.Group controlId='insuranceName'>
              <Form.Label>Insurance Name</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='claim'>
              <Form.Label>Claim</Form.Label>
              <Form.Control type='number' required />
            </Form.Group>

            <Form.Group controlId='premium'>
              <Form.Label>Premium (₹/month)</Form.Label>
              <Form.Control type='number' required />
            </Form.Group>

            <Form.Group controlId='tag1'>
              <Form.Label>Tag 1</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='tag2'>
              <Form.Label>Tag 2</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='tag3'>
              <Form.Label>Tag 3</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='description'>
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' rows={3} required />
            </Form.Group>

            <Button variant='primary' type='submit'>
              Add Insurance
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Counselor Modal */}
      <Modal
        show={showCounselorModal}
        onHide={() => setShowCounselorModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Counselor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddCounselor}>
            {/* Form fields for new counselor */}
            <Form.Group controlId='counselorName'>
              <Form.Label>Name</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='counselorPhone'>
              <Form.Label>Phone</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='counselorEmail'>
              <Form.Label>Email</Form.Label>
              <Form.Control type='email' required />
            </Form.Group>

            <Form.Group controlId='counselorTag1'>
              <Form.Label>Tag 1</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='counselorTag2'>
              <Form.Label>Tag 2</Form.Label>
              <Form.Control type='text' required />
            </Form.Group>

            <Form.Group controlId='counselorLogo'>
              <Form.Label>Logo</Form.Label>
              <Form.Control type='file' required />
            </Form.Group>

            {error && <p className='text-danger'>{error}</p>}

            <Button variant='primary' type='submit'>
              Add Counselor
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default InsurerProfilePage;
