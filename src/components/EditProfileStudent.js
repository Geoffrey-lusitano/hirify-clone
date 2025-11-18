import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import EditProfileCompany from './EditProfileCompany';

const db = getFirestore(app);

const EditProfileStudent = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const [form, setForm] = useState({
    description: '',
    addressType: '',
    address: '',
    postalCode: '',
    city: '',
    cursus: '',
    domain: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm(docSnap.data());
        setUserInfo({ ...user, role: docSnap.data().role });
      } else {
        setUserInfo(user);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...form,
        name: user.displayName,
        email: user.email,
        role: 'student',
      });
      setSuccess('Profil mis à jour ! Redirection...');
      setTimeout(() => navigate('/suggest'), 1200);
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
    }
    setLoading(false);
  };

  if (!user) return <div className="error" style={{ textAlign: 'center', padding: '1rem' }}>Veuillez vous connecter.</div>;
  if (userInfo && userInfo.role === 'company') {
    return <EditProfileCompany />;
  }

  const containerStyle = {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: 'var(--primary)'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const formGroupStyle = {
    marginBottom: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: 'var(--primary-dark)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1.5px solid #e0e7ef',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: '#fff',
    transition: 'border 0.18s, box-shadow 0.18s',
    boxShadow: 'var(--shadow)'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical'
  };

  const addressRowStyle = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const btnPrimary = {
    padding: '12px 28px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: 'var(--shadow)',
    cursor: 'pointer',
    transition: 'background 0.18s, box-shadow 0.18s',
    marginTop: '8px',
    width: '100%'
  };

  const btnDisabled = {
    ...btnPrimary,
    backgroundColor: '#a0d1dd',
    cursor: 'not-allowed',
    boxShadow: 'none'
  };

  const alertError = {
    color: '#c62828',
    background: '#fff6f6',
    borderLeft: '4px solid #c62828',
    padding: '8px 12px',
    borderRadius: '8px',
    margin: '8px 0'
  };

  const alertSuccess = {
    color: '#1b8d44',
    background: '#f6fff6',
    borderLeft: '4px solid #1b8d44',
    padding: '8px 12px',
    borderRadius: '8px',
    margin: '8px 0'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Profil étudiant</h1>
        <h2>{user.displayName}</h2>
      </div>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            style={textareaStyle}
            placeholder="Décrivez votre parcours, vos compétences et vos attentes..."
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={addressRowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="addressType">Type de voie</label>
            <input
              id="addressType"
              type="text"
              name="addressType"
              style={inputStyle}
              placeholder="Ex: Rue, avenue..."
              value={form.addressType}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={{ flex: 2 }}>
            <label style={labelStyle} htmlFor="address">Adresse</label>
            <input
              id="address"
              type="text"
              name="address"
              style={inputStyle}
              placeholder="Votre adresse"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div style={addressRowStyle}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle} htmlFor="postalCode">Code postal</label>
            <input
              id="postalCode"
              type="text"
              name="postalCode"
              style={inputStyle}
              placeholder="Code postal"
              value={form.postalCode}
              onChange={handleChange}
              required
            />
          </div>
          
          <div style={{ flex: 2 }}>
            <label style={labelStyle} htmlFor="city">Ville</label>
            <input
              id="city"
              type="text"
              name="city"
              style={inputStyle}
              placeholder="Ville"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="cursus">Type de cursus</label>
          <input
            id="cursus"
            type="text"
            name="cursus"
            style={inputStyle}
            placeholder="Ex: BTS, DUT, Licence, Master..."
            value={form.cursus}
            onChange={handleChange}
            required
          />
        </div>
        
        <div style={formGroupStyle}>
          <label style={labelStyle} htmlFor="domain">Domaine de compétence</label>
          <input
            id="domain"
            type="text"
            name="domain"
            style={inputStyle}
            placeholder="Ex: Développement web, Marketing digital..."
            value={form.domain}
            onChange={handleChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          style={loading ? { ...btnPrimary, ...btnDisabled } : btnPrimary}
        >
          {loading ? 'Mise à jour en cours...' : 'Mettre à jour mon profil'}
        </button>
        
        {error && <div style={alertError}>{error}</div>}
        {success && <div style={alertSuccess}>{success}</div>}
      </form>
    </div>
  );
};

export default EditProfileStudent;
