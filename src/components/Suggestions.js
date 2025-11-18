import React, { useEffect, useState } from 'react';
import SuggestionCard from './SuggestionCard';
import hirifyLogo from '../assets/hirify-logo.svg';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const Suggestions = () => {
  // Données chargées depuis Firestore
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const currentUserRole = currentUser?.userData?.role;
  const currentUserEmail = currentUser?.userData?.email;
  const [filters, setFilters] = useState({
    domain: '',
    location: '',
    level: ''
  });

  const handleContact = (companyId) => {
    console.log(`Contacter l'entreprise avec l'ID: ${companyId}`);
    // Ici, vous pourriez ajouter la logique pour contacter l'entreprise
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const snap = await getDocs(usersRef);
        const list = [];
        snap.forEach((doc) => {
          const data = doc.data();
          // Exclure l'utilisateur courant
          if (data.email && currentUserEmail && data.email === currentUserEmail) return;
          list.push({
            id: doc.id,
            ...data,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            companyName: data.companyName || '',
            description: data.description || 'Aucune description disponible',
            role: data.role || 'student'
          });
        });
        setSuggestions(list);
      } catch (e) {
        console.error('Erreur Firestore (Suggestions):', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserEmail]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredSuggestions = suggestions
    // Filtrer par rôle opposé pour une expérience cohérente
    .filter(s => {
      if (!currentUserRole) return true; // si pas encore chargé
      if (currentUserRole === 'student') return s.role === 'company';
      if (currentUserRole === 'company') return s.role === 'student';
      return true;
    })
    // Appliquer filtres de recherche simples
    .filter(suggestion => {
      const domainFilter = filters.domain.trim().toLowerCase();
      const locationFilter = filters.location.trim().toLowerCase();

      const matchesDomain =
        domainFilter === '' ||
        (suggestion.domain || '').toLowerCase().includes(domainFilter) ||
        (Array.isArray(suggestion.alternants) && suggestion.alternants.some(alt => (alt.domain || '').toLowerCase().includes(domainFilter)));

      const city = (suggestion.city || '').toLowerCase();
      const postal = String(suggestion.postalCode || '');
      const matchesLocation =
        locationFilter === '' ||
        city.includes(locationFilter) ||
        postal.includes(filters.location);

      return matchesDomain && matchesLocation;
    });

  if (loading) {
    return (
      <div className="suggestions-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <img src={hirifyLogo} alt="Hirify" style={{ height: 48, opacity: 0.85, marginBottom: 16 }} />
          <p style={{ color: '#607d8b' }}>Chargement des suggestions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suggestions-container">
      <header className="suggestions-header">
        <div className="logo-container">
          <img src={hirifyLogo} alt="Hirify Logo" className="logo" />
          <h1>Découvrez des opportunités d'alternance</h1>
          <p className="subtitle">Trouvez l'entreprise qui correspond à votre profil</p>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="domain">Domaine :</label>
            <input
              type="text"
              id="domain"
              name="domain"
              placeholder="Informatique, Marketing, etc."
              value={filters.domain}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="location">Localisation :</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="Ville ou code postal"
              value={filters.location}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        </div>
      </header>

      <main className="suggestions-grid">
        {filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="suggestion-card-wrapper">
              <SuggestionCard 
                item={suggestion} 
                onContact={() => handleContact(suggestion.id)}
              />
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>Aucune entreprise ne correspond à vos critères de recherche.</p>
            <button 
              onClick={() => setFilters({ domain: '', location: '' })}
              className="reset-filters"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      <style jsx>{`
        .suggestions-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.25rem;
          background: var(--bg);
          min-height: 100vh;
        }
        
        .suggestions-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .logo-container img {
          height: 60px;
          margin-bottom: 1rem;
        }
        
        .suggestions-header h1 {
          color: var(--primary);
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }
        
        .filters {
          display: flex;
          flex-wrap: wrap;
          column-gap: 2.7rem;
          row-gap: 1.25rem;
          justify-content: center;
          margin-top: 2rem;
          background: #fff;
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 1px solid #e0e7ef;
          box-shadow: var(--shadow);
        }
        
        .filter-group {
          flex: 1;
          min-width: 250px;
          max-width: 300px;
        }
        
        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
          text-align: left;
        }
        
        .filter-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e0e7ef;
          border-radius: var(--radius);
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fff;
          box-shadow: var(--shadow);
        }
        
        .filter-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(17, 128, 156, 0.12);
        }
        
        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 4rem;
          margin-top: 2rem;
          align-items: stretch;
        }
        
        .suggestion-card-wrapper {
          transition: transform 0.2s ease, box-shadow 0.18s ease;
          height: 100%;
        }
        
        .suggestion-card-wrapper:hover {
          transform: translateY(-6px);
        }
        
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background: #fff;
          border-radius: var(--radius);
          border: 1px solid #e0e7ef;
          box-shadow: var(--shadow);
        }
        
        .reset-filters {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .reset-filters:hover {
          background: var(--primary-dark);
        }
        
        @media (max-width: 768px) {
          .suggestions-grid {
            grid-template-columns: 1fr;
          }
          
          .filters {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-group {
            max-width: 100%;
          }
          
          .suggestions-header h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Suggestions;
