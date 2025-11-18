import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { app, db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import SuggestionCard from './SuggestionCard';




const Suggest = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      console.log('fetchUsers called, currentUser:', currentUser);
      
      if (!currentUser?.userData) {
        console.log('No current user data, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        console.log('Using Firestore instance...');
        const usersRef = collection(db, 'users');
        
        console.log('Fetching users collection...');
        const querySnapshot = await getDocs(usersRef);
        
        const usersList = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          // Ne pas inclure l'utilisateur courant dans la liste
          if (userData.email !== currentUser.userData?.email) {
            usersList.push({ 
              id: doc.id, 
              ...userData,
              // S'assurer que les champs obligatoires existent
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              companyName: userData.companyName || '',
              description: userData.description || 'Aucune description disponible',
              role: userData.role || 'student'
            });
          }
        });
        
        setUsers(usersList);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      } finally {
        console.log('Loading finished');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, navigate]);

  // Récupérer le rôle et les données de l'utilisateur connecté
  // Les données de l'utilisateur sont dans currentUser.userData
  const currentUserRole = currentUser?.userData?.role;
  const currentUserData = currentUser?.userData || {};
  
  console.log('Current user data:', currentUserData);
  console.log('Current user role:', currentUserRole);
  
  const filteredUsers = users.filter(user => {
    console.log('Checking user:', user.id, 'role:', user.role);
    
    // 1. Vérifier la correspondance des rôles (étudiant <-> entreprise)
    const isRoleMatch = currentUserRole && user.role && 
      ((currentUserRole === 'student' && user.role === 'company') ||
       (currentUserRole === 'company' && user.role === 'student'));
    
    console.log(`Role match for user ${user.id}:`, isRoleMatch);
    if (!isRoleMatch) return false;
    
    // 2. Vérifier la correspondance des domaines
    let domainMatch = false;
    
    if (currentUserRole === 'student' && user.role === 'company') {
      // Étudiant qui voit les entreprises : vérifier si l'entreprise recherche le domaine de l'étudiant
      const studentDomain = currentUserData.domain?.toLowerCase();
      console.log('Student domain:', studentDomain);
      
      if (!studentDomain) return false; // Si l'étudiant n'a pas de domaine, on ne montre rien
      
      // Vérifier si l'entreprise recherche ce domaine
      const companyAltDomains = (user.alternants || [])
        .map(alt => alt.domain?.toLowerCase())
        .filter(Boolean);
      
      domainMatch = companyAltDomains.includes(studentDomain);
      console.log(`Company ${user.companyName} (${user.id}) alt domains:`, companyAltDomains);
      console.log(`Domain match for student:`, domainMatch);
      
    } else if (currentUserRole === 'company' && user.role === 'student') {
      // Entreprise qui voit les étudiants : vérifier si l'étudiant a un domaine recherché par l'entreprise
      const companyAltDomains = (currentUserData.alternants || [])
        .map(alt => alt.domain?.toLowerCase())
        .filter(Boolean);
      
      console.log('Company alt domains:', companyAltDomains);
      
      if (companyAltDomains.length === 0) {
        console.log('No alt domains defined for company');
        return false; // Si l'entreprise ne recherche aucun domaine, on ne montre rien
      }
      
      const studentDomain = user.domain?.toLowerCase();
      console.log(`Student ${user.firstName} ${user.lastName} domain:`, studentDomain);
      
      domainMatch = studentDomain ? companyAltDomains.includes(studentDomain) : false;
      console.log(`Domain match for company:`, domainMatch);
    }
    
    if (!domainMatch) {
      console.log('No domain match for user:', user.id);
      return false;
    }
    
    // 3. Si recherche textuelle, l'appliquer en plus du filtre de domaine
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const searchFields = [
        user.firstName || '',
        user.lastName || '',
        user.companyName || '',
        user.domain || '',
        user.description || '',
        user.address || '',
        user.city || ''
      ];
      
      return searchFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  console.log('Filtered users:', filteredUsers);

  const handleContact = (id) => {
    console.log('Contacter:', id);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Chargement des utilisateurs...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ color: '#1976d2', marginBottom: '10px' }}>Découvrez des profils</h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Trouvez des professionnels et des étudiants en alternance qui correspondent à vos critères
          </p>
          
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Rechercher par nom, entreprise, domaine ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                outline: 'none',
                transition: 'border-color 0.3s, box-shadow 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1976d2';
                e.target.style.boxShadow = '0 0 0 2px rgba(25, 118, 210, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666' }}>Chargement des profils...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '24px',
            padding: '10px 0'
          }}>
            {filteredUsers.map((user) => (
              <SuggestionCard 
                key={user.id} 
                item={user}
                onContact={() => handleContact(user.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px dashed #ddd'
          }}>
            <p style={{ 
              fontSize: '18px', 
              color: '#666',
              marginBottom: '20px'
            }}>
              Aucun profil ne correspond à votre recherche
            </p>
            <button
              onClick={() => setSearchTerm('')}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1565c0'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
            >
              Réinitialiser la recherche
            </button>
            <p>Aucun utilisateur trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggest;
