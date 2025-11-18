import React, { useState, useEffect } from 'react';
import { getAuth, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { app } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

const db = getFirestore(app);

const EditProfileCompany = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const user = auth.currentUser;
  const [form, setForm] = useState({
    description: '',
    addressType: '',
    address: '',
    postalCode: '',
    city: '',
    alternants: [
      { cursus: '', domain: '' }
    ],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm({ ...form, ...docSnap.data(), alternants: docSnap.data().alternants || [{ cursus: '', domain: '' }] });
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAlternantChange = (idx, e) => {
    const newAlternants = [...form.alternants];
    newAlternants[idx][e.target.name] = e.target.value;
    setForm({ ...form, alternants: newAlternants });
  };

  const handleAddAlternant = () => {
    setForm({ ...form, alternants: [...form.alternants, { cursus: '', domain: '' }] });
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
        role: 'company',
      });
      setSuccess('Profil entreprise mis à jour ! Redirection...');
      setTimeout(() => navigate('/suggest'), 1200);
    } catch (err) {
      setError('Erreur lors de la sauvegarde: ' + err.message);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Supprimer les données de l'utilisateur dans Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await deleteDoc(userDocRef);
      
      // Supprimer le compte d'authentification
      await deleteUser(user);
      
      // Déconnecter l'utilisateur
      await signOut(auth);
      
      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de la suppression du compte:', err);
      setError('Erreur lors de la suppression du compte: ' + err.message);
      setLoading(false);
    }
  };

  if (!user) return <div className="error" style={{ textAlign: 'center', padding: '1rem' }}>Veuillez vous connecter.</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profil entreprise</h1>
        <h2>{user.displayName}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="description">Description de l'entreprise</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            placeholder="Présentez votre entreprise, ses activités et ses valeurs..."
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="address-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="addressType">Type de voie</label>
            <input
              id="addressType"
              type="text"
              name="addressType"
              className="form-control"
              placeholder="Ex: Rue, avenue..."
              value={form.addressType}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="address">Adresse</label>
            <input
              id="address"
              type="text"
              name="address"
              className="form-control"
              placeholder="Adresse du siège social"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="address-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="postalCode">Code postal</label>
            <input
              id="postalCode"
              type="text"
              name="postalCode"
              className="form-control"
              placeholder="Code postal"
              value={form.postalCode}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="city">Ville</label>
            <input
              id="city"
              type="text"
              name="city"
              className="form-control"
              placeholder="Ville"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <h3 className="section-title">Type d'alternant(s) recherché(s)</h3>
        
        {form.alternants.map((alt, idx) => (
          <div key={idx} className="alternant-item">
            {form.alternants.length > 1 && (
              <button 
                type="button" 
                className="alternant-remove"
                onClick={() => {
                  const newAlternants = form.alternants.filter((_, i) => i !== idx);
                  setForm({ ...form, alternants: newAlternants });
                }}
                title="Supprimer ce type d'alternant"
              >
                ×
              </button>
            )}
            <div className="address-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor={`cursus-${idx}`}>Type de formation</label>
                <input
                  id={`cursus-${idx}`}
                  type="text"
                  name="cursus"
                  className="form-control"
                  placeholder="Ex: BTS, Licence, Master..."
                  value={alt.cursus}
                  onChange={e => handleAlternantChange(idx, e)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label htmlFor={`domain-${idx}`}>Domaine recherché</label>
                <input
                  id={`domain-${idx}`}
                  type="text"
                  name="domain"
                  className="form-control"
                  placeholder="Ex: Développement web, Marketing digital..."
                  value={alt.domain}
                  onChange={e => handleAlternantChange(idx, e)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          type="button" 
          className="btn btn-outline"
          onClick={handleAddAlternant}
        >
          + Ajouter un type d'alternant
        </button>
        
        <button 
          type="submit" 
          className={`btn ${loading ? 'btn-disabled' : ''}`}
          disabled={loading}
        >
          {loading ? 'Mise à jour en cours...' : 'Mettre à jour mon profil'}
        </button>
        
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        
        <div className="danger-zone">
          <h3>Zone dangereuse</h3>
          <p>
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
          </p>
          <button 
            type="button" 
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            Supprimer mon compte
          </button>
          
          {showDeleteConfirm && (
            <div className="delete-confirm">
              <p>Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.</p>
              <div className="confirm-buttons">
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Suppression...' : 'Oui, supprimer'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 24px;
          background: #fff;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }
        
        .profile-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        
        .profile-header h1, 
        .profile-header h2 {
          color: var(--primary);
          margin: 0.5rem 0;
        }
        
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--primary-dark);
        }
        
        .form-control {
          width: 100%;
          padding: 12px;
          border: 1.5px solid #e0e7ef;
          border-radius: var(--radius);
          font-size: 1rem;
          outline: none;
          background: #fff;
          transition: border 0.18s, box-shadow 0.18s;
          box-shadow: var(--shadow);
        }
        
        .form-control:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(17, 128, 156, 0.2);
        }
        
        textarea.form-control {
          min-height: 120px;
          resize: vertical;
        }
        
        .address-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .section-title {
          color: var(--primary);
          margin: 1.5rem 0 1rem;
        }
        
        .btn {
          padding: 12px 28px;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: var(--radius);
          font-size: 1rem;
          font-weight: 600;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: all 0.18s;
          margin-top: 8px;
          width: 100%;
        }
        
        .btn:hover:not(:disabled) {
          background: var(--primary-dark);
          box-shadow: 0 4px 12px rgba(17, 128, 156, 0.2);
        }
        
        .btn:disabled,
        .btn-disabled {
          background: #a0d1dd;
          cursor: not-allowed;
          box-shadow: none;
        }
        
        .btn-outline {
          background: transparent;
          border: 2px solid var(--primary);
          color: var(--primary);
          margin: 0.5rem 0;
        }
        
        .btn-outline:hover:not(:disabled) {
          background: rgba(17, 128, 156, 0.1);
        }
        
        .btn-danger {
          background: #d32f2f;
        }
        
        .btn-danger:hover:not(:disabled) {
          background: #b71c1c;
          box-shadow: 0 4px 12px rgba(211, 47, 47, 0.2);
        }
        
        .btn-cancel {
          background: #f5f5f5;
          color: #666;
          border: 2px solid #ddd;
        }
        
        .btn-cancel:hover:not(:disabled) {
          background: #eee;
          box-shadow: none;
        }
        
        .alert {
          padding: 8px 12px;
          border-radius: 8px;
          margin: 8px 0;
        }
        
        .alert.error {
          color: #c62828;
          background: #fff6f6;
          border-left: 4px solid #c62828;
        }
        
        .alert.success {
          color: #1b8d44;
          background: #f6fff6;
          border-left: 4px solid #1b8d44;
        }
        
        .danger-zone {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #ffcdd2;
        }
        
        .danger-zone h3 {
          color: #d32f2f;
          margin-bottom: 1rem;
        }
        
        .danger-zone p {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }
        
        .delete-confirm {
          margin-top: 1rem;
          padding: 1rem;
          background: #ffebee;
          border-radius: 8px;
        }
        
        .delete-confirm p {
          color: #c62828;
          margin-bottom: 1rem;
        }
        
        .confirm-buttons {
          display: flex;
          gap: 1rem;
        }
        
        .alternant-item {
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: var(--radius);
          margin-bottom: 1.25rem;
          position: relative;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .alternant-remove {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: none;
          border: none;
          color: #d32f2f;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
          padding: 0.25rem;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .alternant-remove:hover {
          background: rgba(211, 47, 47, 0.1);
        }
        
        @media (max-width: 768px) {
          .profile-container {
            margin: 1rem;
            padding: 16px;
          }
          
          .address-row {
            flex-direction: column;
            gap: 0;
          }
          
          .confirm-buttons {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EditProfileCompany;
