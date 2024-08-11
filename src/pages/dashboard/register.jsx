import React, { useState } from 'react';
import { db } from './../../../firebase'; // Adjust the import path as necessary
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Replace this URL with the URL of your deployed Cloud Function
const SEND_PASSWORD_EMAIL_URL = 'https://sendemail-j4m3al2vxa-el.a.run.app';

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    district: '',
    userType: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value ? 'Name is required' : '';
      case 'email':
        return !value ? 'Email is required' : '';
      case 'phone':
        return !value ? 'Phone number is required' : '';
      case 'address':
        return !value ? 'Address is required' : '';
      case 'state':
        return !value ? 'State is required' : '';
      case 'district':
        return !value ? 'District is required' : '';
      case 'userType':
        return !value ? 'User Type is required' : '';
      default:
        return '';
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const sendPasswordEmail = async (email, name, password) => {
    try {
      const response = await fetch(SEND_PASSWORD_EMAIL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Your Registration Password',
          html: `<h1>Hello ${name}</h1><p>Your registration password is: <strong>${password}</strong></p>`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      console.log('Password email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Re-throw the error to handle it in handleSubmit
    }
  };

  const validateForm = () => {
    let formErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) formErrors[key] = error;
    });

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const password = generateRandomPassword();
    const auth = getAuth();

    try {
      // Create user with email and password in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
      const user = userCredential.user;

      // Call the Cloud Function to send the password via email
      await sendPasswordEmail(formData.email, formData.name, password);

      // Save user data to Firestore (without the password)
      await addDoc(collection(db, "registrations"), { 
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        userType: formData.userType,
        uid: user.uid // Store the Firebase Auth user ID
      });

      alert("User registered successfully! A password has been sent to the provided email.");

      // Reset the form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        state: '',
        district: '',
        userType: '',
      });
      setErrors({});
    } catch (error) {
      console.error("Error registering user:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
            className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded`}
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
            className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
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
            className={`w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded`}
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
            className={`w-full p-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded`}
          ></textarea>
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

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
          </select>
          {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
        </div>

        <div className="mb-4">
          <input
            type="text"
            name="district"
            placeholder="District"
            value={formData.district}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full p-2 border ${errors.district ? 'border-red-500' : 'border-gray-300'} rounded`}
          />
          {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
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
            <option value="Factory">Factory</option>
            <option value="District">District</option>
            <option value="Mandal">Mandal</option>
          </select>
          {errors.userType && <p className="text-red-500 text-sm">{errors.userType}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-black"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        {loading && (
          <div className="flex justify-center mt-4">
            <svg className="w-6 h-6 text-gray-700 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0116 0 8 8 0 01-16 0z"></path>
            </svg>
          </div>
        )}
      </form>
    </div>
  );
}

export default Register;
