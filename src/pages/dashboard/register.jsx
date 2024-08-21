import React, { useState, useEffect } from 'react';
import { db } from './../../../firebase'; // Adjust the import path as necessary
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { apDistricts, tgDistricts, odDistricts } from './district'; // Import districts

const SEND_PASSWORD_EMAIL_URL = 'https://sendemail-j4m3al2vxa-el.a.run.app';

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    district: '',
    mandal: '',
    userType: '',
    factory: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [factories, setFactories] = useState(['Nallapadu,Guntur']); // Example factory list

  useEffect(() => {
    if (formData.state && formData.userType !== 'Factory') {
      switch (formData.state) {
        case 'Andhra Pradesh':
          setDistricts(Object.keys(apDistricts));
          break;
        case 'Telangana':
          setDistricts(Object.keys(tgDistricts));
          break;
        case 'Odisha':
          setDistricts(Object.keys(odDistricts));
          break;
        default:
          setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
  }, [formData.state, formData.userType]);

  useEffect(() => {
    if (formData.district && formData.userType !== 'Factory') {
      const districtData = {
        'Andhra Pradesh': apDistricts,
        'Telangana': tgDistricts,
        'Odisha': odDistricts,
      };
      const districtKey = formData.state;
      const mandalData = districtData[districtKey]?.[formData.district] || [];
      setMandals(mandalData);
    } else {
      setMandals([]);
    }
  }, [formData.district, formData.state, formData.userType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value ? 'Name is required' : '';
      case 'email':
        return !value ? 'Email is required' : '';
      case 'phone':
        if (!value) return 'Phone number is required';
        if (value.length !== 10) return 'Phone number must be exactly 10 digits';
        if (!/^\d{10}$/.test(value)) return 'Phone number must contain only digits';
        return '';
      case 'address':
        return !value ? 'Address is required' : '';
      case 'state':
        return (formData.userType === 'State' || formData.userType !== 'Factory') && !value ? 'State is required' : '';
      case 'district':
        return formData.userType !== 'Factory' && formData.userType !== 'State' && !value ? 'District is required' : '';
      case 'mandal':
        return formData.userType === 'Mandal' && !value ? 'Mandal is required' : '';
      case 'userType':
        return !value ? 'User Type is required' : '';
      case 'factory':
        return formData.userType !== 'Mandal' && formData.userType !== 'State' && !value ? 'Factory selection is required' : '';
      default:
        return '';
    }
  };
  

  const validateForm = () => {
    const formErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) formErrors[key] = error;
    });
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const sendPasswordEmail = async (email, name, password) => {
    try {
      const response = await fetch(SEND_PASSWORD_EMAIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Your Registration Password',
          html: `<h1>Hello ${name}</h1>
    <p>Your registration password is: <strong>${password}</strong></p>
    <p>From Flavour's Ocean Ice Cream</p>`,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      console.log('Password email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const password = generateRandomPassword();
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
      const user = userCredential.user;

      await sendPasswordEmail(formData.email, formData.name, password);

      await addDoc(collection(db, 'registrations'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        district: formData.userType !== 'Factory' && formData.userType !== 'State' ? formData.district : '',
        mandal: formData.userType === 'Mandal' ? formData.mandal : '',
        userType: formData.userType,
        factory: formData.userType !== 'Mandal' && formData.userType !== 'State' ? formData.factory : '',
        uid: user.uid,
      });

      alert('User registered successfully! A password has been sent to the provided email.');

      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        district: '',
        mandal: '',
        userType: '',
        factory: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error registering user:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Register User</h2>

        <div className="mb-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded placeholder-gray-600`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded placeholder-gray-600`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div className="mb-4">
        <input
  type="text"
  name="phone"
  placeholder="Phone"
  value={formData.phone}
  onChange={handleChange}
  onBlur={handleBlur}
  maxLength="10"
  pattern="\d{10}"
  title="Phone number must be exactly 10 digits"
  className={`w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded placeholder-gray-600`}
/>

          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="mb-4">
          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded placeholder-gray-600`}
          ></textarea>
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        <div className="mb-6">
          <select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2 border ${errors.userType ? 'border-red-500' : 'border-gray-300'} rounded`}
          >
            <option value="">Select User Type</option>
            <option value="State">State</option>
            <option value="Factory">Factory</option>
            <option value="District">District</option>
            <option value="Mandal">Mandal</option>
          </select>
          {errors.userType && <p className="text-red-500 text-sm">{errors.userType}</p>}
        </div>

        {formData.userType !== 'Factory' && (
          <div className="mb-4">
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded`}
            >
              <option value="">Select State</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Odisha">Odisha</option>
            </select>
            {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
          </div>
        )}

        {formData.userType !== 'Factory' && formData.userType !== 'State' && (
          <>
            <div className="mb-4">
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-2 border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded`}
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
            </div>

            {formData.userType === 'Mandal' && (
              <div className="mb-4">
                <select
                  name="mandal"
                  value={formData.mandal}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border ${errors.mandal ? 'border-red-500' : 'border-gray-300'} rounded`}
                >
                  <option value="">Select Mandal</option>
                  {mandals.map((mandal) => (
                    <option key={mandal} value={mandal}>
                      {mandal}
                    </option>
                  ))}
                </select>
                {errors.mandal && <p className="text-red-500 text-sm">{errors.mandal}</p>}
              </div>
            )}
          </>
        )}

        {(formData.userType !== 'Mandal' && formData.userType !== 'State') && (
          <div className="mb-4">
            <select
              name="factory"
              value={formData.factory}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-2 border ${errors.factory ? 'border-red-500' : 'border-gray-300'} rounded`}
            >
              <option value="">Select Factory</option>
              {factories.map((factory) => (
                <option key={factory} value={factory}>
                  {factory}
                </option>
              ))}
            </select>
            {errors.factory && <p className="text-red-500 text-sm">{errors.factory}</p>}
          </div>
        )}

        <button
          type="submit"
          className={`w-full p-2 text-white rounded ${loading ? 'bg-gray-700' : 'bg-gray-900 hover:bg-black'}`}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
