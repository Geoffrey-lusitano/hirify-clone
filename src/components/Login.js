import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { app } from '../firebase/firebase';
import hirifyLogo from '../assets/hirify-logo.svg';

const Login = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

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
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const db = (await import('firebase/firestore')).getFirestore(app);
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      setSuccess('Connexion réussie ! Redirection...');
      setTimeout(() => {
        if (docSnap.exists() && docSnap.data().description) {
          router.push('/suggest');
        } else {
          router.push('/profile');
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className="logo-container">
          <Link href="/">
            <a>
              <img src={hirifyLogo} alt="Hirify Logo" />
            </a>
          </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Entrez votre email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="auth-footer">
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-link">
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
      
      <style jsx>{`
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
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
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
    </div>
  );
};

export default Login;
