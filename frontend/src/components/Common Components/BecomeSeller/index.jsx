import React, { useState, useEffect, useRef } from 'react';
import './BecomeSeller.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf } from '@fortawesome/free-solid-svg-icons';

const BecomeSeller = () => {
  const [loading, setLoading] = useState(true);
  const [canApply, setCanApply] = useState(false);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const [licenseFile, setLicenseFile] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  const [formData, setFormData] = useState({
    storeName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    address: {
      line1: '',
      country: 'India',
      state: '',
      city: '',
      pincode: '',
    },
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
    },
  });

  /* ---------------- BUSINESS TYPES ---------------- */
  const businessTypes = [
    'Individual',
    'Partnership / LLP',
    'Private Limited Company',
    'Co-operative Society',
  ];

  /* ---------------- SELLER STATUS ---------------- */
  useEffect(() => {
    const checkSellerStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/seller/status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        setCanApply(data.canApply);
        setSellerStatus(data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkSellerStatus();
  }, []);

  /* ---------------- DROPDOWN STATE ---------------- */
  const [openBusiness, setOpenBusiness] = useState(false);
  const businessRef = useRef();

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (businessRef.current && !businessRef.current.contains(e.target)) {
        setOpenBusiness(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleBankChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value },
    }));
  };

  /* ---------------- PINCODE LOOKUP ---------------- */
  const fetchAddressFromPincode = async (pincode) => {
    if (pincode.length !== 6) return;

    try {
      setPincodeLoading(true);
      setPincodeError('');

      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();

      if (data[0].Status !== 'Success') {
        setPincodeError('Invalid pincode');
        return;
      }

      const po = data[0].PostOffice[0];

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          state: po.State,
          city: po.District,
          line1: po.Name,
          pincode,
        },
      }));
    } catch {
      setPincodeError('Failed to fetch address');
    } finally {
      setPincodeLoading(false);
    }
  };

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  const accountNumberRegex = /^[0-9]{9,18}$/;

  const validateForm = () => {
    const newErrors = {};

    if (!panRegex.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN Format (ABCDE1234F)';
    }

    if (
      formData.businessType !== 'Individual' &&
      !gstRegex.test(formData.gstNumber)
    ) {
      newErrors.gstNumber = 'Invalid GST Format';
    }

    if (!ifscRegex.test(formData.bankDetails.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC Code Format';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Please select business type';
    }

    if (!accountNumberRegex.test(formData.bankDetails.accountNumber)) {
      newErrors.accountNumber =
        'Account number must be 9–18 digits (numbers only)';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!licenseFile) return alert('Please upload license image');

    if (!validateForm()) return;

    try {
      const form = new FormData();
      form.append('storeName', formData.storeName);
      form.append('businessType', formData.businessType);
      form.append('gstNumber', formData.gstNumber);
      form.append('panNumber', formData.panNumber);
      form.append('licenseImage', licenseFile);
      form.append('address', JSON.stringify(formData.address));
      form.append('bankDetails', JSON.stringify(formData.bankDetails));

      const res = await fetch('http://localhost:5000/api/seller/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.msg || 'Failed');

      alert('Seller application submitted');
      window.location.reload();
    } catch {
      alert('Something went wrong');
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (loading) return <p className="loading-text">Checking seller status...</p>;

  if (sellerStatus === 'pending') {
    return (
      <div className="seller-container">
        <div className="status-card pending">
          <FontAwesomeIcon icon={faHourglassHalf} className="status-icon" />
          <h2>Application Under Review</h2>
          <p>Your application is being reviewed.</p>
          <span className="status-note">Usually takes 24–48 hours ⏳</span>
        </div>
      </div>
    );
  }

  if (!canApply) return null;

  /* ---------------- DROPDOWN COMPONENT ---------------- */
  const Dropdown = ({ options, value, setValue, open, setOpen, label }) => (
    <div className="custom-select-dropdown" ref={businessRef}>
      <div className="select-box" onClick={() => setOpen(!open)}>
        {value || label}
        <span className="arrow">▾</span>
      </div>
      {open && (
        <ul className="select-options">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                setValue(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  /* ---------------- FORM ---------------- */
  return (
    <div className="seller-container">
      <h1 className="heading">
        Seller <span>Form</span>
      </h1>

      <form className="seller-form" onSubmit={handleSubmit}>
        <input
          placeholder="Store Name"
          required
          value={formData.storeName}
          onChange={(e) =>
            setFormData({ ...formData, storeName: e.target.value })
          }
        />

        {/* Business Type Dropdown */}
        <Dropdown
          options={businessTypes}
          value={formData.businessType}
          setValue={(val) => setFormData({ ...formData, businessType: val })}
          open={openBusiness}
          setOpen={setOpenBusiness}
          label="Select Business Type"
        />
        {errors.businessType && (
          <p className="error-text">{errors.businessType}</p>
        )}

        <input
          placeholder="GST Number"
          value={formData.gstNumber}
          onChange={(e) =>
            setFormData({ ...formData, gstNumber: e.target.value })
          }
          required={formData.businessType !== 'Individual'}
        />
        {errors.gstNumber && <p className="error-text">{errors.gstNumber}</p>}

        <input
          placeholder="PAN Number"
          required
          value={formData.panNumber}
          onChange={(e) =>
            setFormData({ ...formData, panNumber: e.target.value })
          }
        />
        {errors.panNumber && <p className="error-text">{errors.panNumber}</p>}

        <h4>Business License</h4>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setLicenseFile(e.target.files[0])}
        />

        <h4>Address</h4>
        <p className="info-text" style={{ fontSize: '1rem' }}>
          Enter your <strong>6-digit pincode</strong>. State & city will be
          auto-filled.
        </p>

        <input
          placeholder="Address Line"
          required
          value={formData.address.line1}
          onChange={(e) => handleAddressChange('line1', e.target.value)}
        />

        <input value="India" disabled className="readonly-input" />
        <input
          placeholder="State"
          value={formData.address.state}
          disabled
          className="readonly-input"
        />
        <input
          placeholder="City / District"
          value={formData.address.city}
          disabled
          className="readonly-input"
        />

        <input
          placeholder="Pincode"
          required
          maxLength="6"
          value={formData.address.pincode}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '');
            handleAddressChange('pincode', v);
            if (v.length === 6) fetchAddressFromPincode(v);
          }}
        />

        {pincodeLoading && <p className="info-text">Fetching address…</p>}
        {pincodeError && <p className="error-text">{pincodeError}</p>}

        <h4>Bank Details</h4>
        <input
          placeholder="Account Holder Name"
          required
          value={formData.bankDetails.accountHolderName}
          onChange={(e) =>
            handleBankChange('accountHolderName', e.target.value)
          }
        />
        <input
          placeholder="Bank Name"
          required
          value={formData.bankDetails.bankName}
          onChange={(e) => handleBankChange('bankName', e.target.value)}
        />
        <input
          placeholder="Account Number"
          required
          value={formData.bankDetails.accountNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            handleBankChange('accountNumber', value);
          }}
        />
        {errors.accountNumber && (
          <p className="error-text">{errors.accountNumber}</p>
        )}

        <input
          placeholder="IFSC Code"
          required
          value={formData.bankDetails.ifscCode}
          onChange={(e) => handleBankChange('ifscCode', e.target.value)}
        />
        {errors.ifscCode && <p className="error-text">{errors.ifscCode}</p>}

        <input
          placeholder="UPI ID"
          value={formData.bankDetails.upiId}
          onChange={(e) => handleBankChange('upiId', e.target.value)}
          required
        />

        <button type="submit" disabled={pincodeLoading}>
          {pincodeLoading ? 'Validating Address…' : 'Apply as Seller'}
        </button>
      </form>
    </div>
  );
};

export default BecomeSeller;
