import React, { useState } from 'react';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { app } from '../firebase/firebase';
import AddressInput from './AddressInput';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'student',
    firstName: '',
    lastName: '',
    companyName: '',
    siret: '',
    email: '',
    password: '',
    address: '',
    postcode: '',
    city: '',
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      if (form.role === 'student') {
        await updateProfile(userCredential.user, {
          displayName: `${form.firstName} ${form.lastName}`,
        });
      } else {
        await updateProfile(userCredential.user, {
          displayName: form.companyName,
        });
      }
      // Sauvegarde du profil minimal dans Firestore
      const db = getFirestore(app);
      const userData = {
        email: form.email,
        role: form.role,
        createdAt: new Date(),
        ...(form.role === 'student' ? {
          firstName: form.firstName,
          lastName: form.lastName,
        } : {
          companyName: form.companyName,
          siret: form.siret,
        }),
        // Ajout des informations d'adresse si disponibles
        ...(form.address && {
          address: form.address,
          postcode: form.postcode,
          city: form.city,
          location: form.latitude && form.longitude ? {
            latitude: form.latitude,
            longitude: form.longitude
          } : null
        })
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      setSuccess('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .auth-bg {
          height: 100vh;
          width: 100vw;
          background: linear-gradient(120deg, #e3f1f6 0%, #f6fbfd 50%, #11809C 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          box-sizing: border-box;
        }
        .auth-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 500px;
        }
        .auth-title {
          color: #11809C;
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 24px;
          text-align: center;
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
        }
        .auth-form {
          box-shadow: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-row {
          display: flex;
          gap: 22px;
          width: 100%;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }
        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
        }
        .form-input {
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #11809C;
          box-shadow: 0 0 0 2px rgba(17, 128, 156, 0.2);
        }
        .form-select {
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          background-color: white;
          cursor: pointer;
        }
        .auth-btn {
          background: #11809C;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 24px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
        }
        .auth-btn:hover {
          background: #0c5d6f;
        }
        .auth-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          color: #666;
        }
        .auth-link {
          color: #11809C;
          font-weight: 600;
          text-decoration: none;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
        .error-message {
          color: #e74c3c;
          background: #fde8e8;
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-top: 10px;
        }
        .success-message {
          color: #27ae60;
          background: #e8f8f0;
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-top: 10px;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo-container img {
          height: 60px;
          margin-bottom: 10px;
        }
        @media (max-width: 600px) {
          .auth-container {
            padding: 30px 20px;
            margin: 0 15px;
          }
          .auth-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
      
      <div className="auth-bg">
        <div className="auth-container">
          <h1 className="auth-title">Créer un compte</h1>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">Je suis</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="student">Étudiant</option>
                <option value="company">Entreprise</option>
              </select>
            </div>

            {form.role === 'student' ? (
              <div className="form-row">
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="lastName">Nom</label>
                  <input
                    style={{ width: '165px' }}
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-input"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom"
                  />
                </div>
                <div className="form-group" style={{ flex: 1, marginRight: '10px' }}>
                  <label htmlFor="firstName">Prénom</label>
                  <input
                    style={{ width: '165px' }}
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-input"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Votre prénom"
                  />
                </div>
              </div>
            ) : null}

            {form.role === 'company' && (
              <div className="form-row">
              <div className="form-group">
                <label>Nom de l'entreprise</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Nom de votre entreprise"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>n° de siret</label>
                <input
                  type="text"
                  name="siret"
                  placeholder="n° de siret"
                  value={form.siret}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            )}
            <div className="form-group">
              <label>Adresse</label>
              <AddressInput
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                onSelect={(addressData) => {
                  setForm({
                    ...form,
                    address: addressData.address,
                    postcode: addressData.postcode,
                    city: addressData.city,
                    latitude: addressData.latitude,
                    longitude: addressData.longitude
                  });
                }}
                placeholder="Commencez à taper une adresse..."
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="form-input"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="auth-btn"
            >
              {loading ? 'Création en cours...' : "S'inscrire"}
            </button>
          </form>
          <div className="auth-footer">
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-link">
              Connectez-vous
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
