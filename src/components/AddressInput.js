import React, { useState, useEffect, useRef } from 'react';

const AddressInput = ({ value, onChange, onSelect, placeholder, className, style }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef(null);

  // Mettre à jour la valeur de l'input quand la prop value change
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAddresses = async (query) => {
    console.log('fetchAddresses appelé avec la requête:', query);
    if (query.length < 3) {
      console.log('Requête trop courte, moins de 3 caractères');
      setSuggestions([]);
      return;
    }

    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`;
      console.log('URL de la requête:', url);
      
      const response = await fetch(url);
      console.log('Réponse reçue, statut:', response.status);
      
      const data = await response.json();
      console.log('Données reçues:', data);
      
      if (data.features && data.features.length > 0) {
        console.log(`${data.features.length} suggestions trouvées`);
        setSuggestions(data.features);
      } else {
        console.log('Aucune suggestion trouvée');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des adresses:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    console.log('Changement de valeur du champ:', value);
    setInputValue(value);
    onChange?.(e); // Appel de la fonction onChange originale si elle existe
    
    // Ne pas déclencher la recherche si moins de 3 caractères
    if (value.length >= 3) {
      fetchAddresses(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    const fullAddress = suggestion.properties.label;
    setInputValue(fullAddress);
    setShowSuggestions(false);
    
    // Appeler la fonction onSelect avec les détails de l'adresse sélectionnée
    if (onSelect) {
      onSelect({
        address: fullAddress,
        postcode: suggestion.properties.postcode,
        city: suggestion.properties.city,
        latitude: suggestion.geometry.coordinates[1],
        longitude: suggestion.geometry.coordinates[0],
        context: suggestion.properties.context
      });
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
        style={{...style, width: '92%'}}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '4px',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: 0,
          listStyle: 'none',
          width: '100%'
        }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                ':hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {suggestion.properties.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressInput;
