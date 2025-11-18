import React from 'react';

const SuggestionCard = ({ item, onContact }) => {
  // Déterminer le type d'utilisateur (entreprise ou étudiant)
  const isCompany = item.role === 'company';
  const displayName = isCompany 
    ? item.companyName 
    : `${item.firstName || ''} ${item.lastName || ''}`.trim();

  // Rendre le composant
  return (
    <div style={{
      border: '1px solid #e0e7ef',
      borderRadius: 'var(--radius)',
      padding: '20px',
      boxShadow: 'var(--shadow)',
      backgroundColor: '#fff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease'
    }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>{displayName}</h3>
        <p style={{ margin: '0 0 12px 0', color: '#4a5568', minHeight: '44px', lineHeight: 1.5 }}>
          {item.description || 'Aucune description disponible'}
        </p>
        {item.domain && (
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#334e68' }}>
              {isCompany ? 'Domaines recherchés :' : 'Domaine :'}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {isCompany && item.alternants ? (
                item.alternants.map((alt, idx) => (
                  <span 
                    key={idx}
                    style={{
                      backgroundColor: '#eaf5f8',
                      color: 'var(--primary)',
                      padding: '6px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '6px',
                      display: 'inline-block'
                    }}
                  >
                    {alt.domain} {alt.cursus ? `(${alt.cursus})` : ''}
                  </span>
                ))
              ) : (
                <span 
                  style={{
                    backgroundColor: '#eaf5f8',
                    color: 'var(--primary)',
                    padding: '6px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}
                >
                  {item.domain}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '14px' }}>
        {(item.address || item.postalCode || item.city) && (
          <p style={{ margin: '6px 0', fontSize: '14px', color: '#607d8b' }}>
            📍 {[item.address, item.postalCode, item.city].filter(Boolean).join(' ')}
          </p>
        )}
        
        <button 
          onClick={onContact}
          className="btn"
          style={{ width: '100%', marginTop: '12px' }}
        >
          Contacter
        </button>
      </div>
    </div>
  );
};

export default SuggestionCard;
