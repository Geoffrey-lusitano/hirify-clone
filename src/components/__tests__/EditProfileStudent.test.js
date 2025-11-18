// src/components/__tests__/EditProfileStudent.test.js
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mocks Firebase
jest.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  __esModule: true,
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));
// Avoid initializing analytics
jest.mock('../../firebase/firebase', () => ({ __esModule: true, app: {} }));
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  Link: ({ to, className, children }) => <a href={to} className={className}>{children}</a>,
}));

import { getAuth } from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';

import EditProfileStudent from '../EditProfileStudent';

describe('Composant EditProfileStudent - Rendu de base', () => {
  beforeEach(() => {
    // Utilisateur connecté par défaut
    getAuth.mockReturnValue({
      currentUser: { uid: 'u1', displayName: 'John Doe', email: 'john@doe.com' },
    });
    // Le profil n’existe pas encore -> pas de rôle "company"
    getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });

  it('affiche le titre et le nom de l’utilisateur', async () => {
    render(<EditProfileStudent />);
    expect(await screen.findByText(/profil étudiant/i)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('affiche les principaux champs du formulaire', async () => {
    render(<EditProfileStudent />);
    // Champs
    expect(await screen.findByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type de voie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^adresse$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type de cursus/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/domaine de compétence/i)).toBeInTheDocument();
    // Bouton
    expect(screen.getByText(/mettre à jour mon profil/i)).toBeInTheDocument();
  });
});

describe('Composant EditProfileStudent - Utilisateur non connecté', () => {
  it('affiche un message demandant la connexion', () => {
    getAuth.mockReturnValue({ currentUser: null });
    render(<EditProfileStudent />);
    expect(screen.getByText(/veuillez vous connecter\./i)).toBeInTheDocument();
  });
});

// Logic tests
const mockNavigate = jest.fn();

describe('Composant EditProfileStudent - Logique', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // default connected user without role (doc fetch will set)
    getAuth.mockReturnValue({ currentUser: { uid: 'u1', displayName: 'John Doe', email: 'john@doe.com' } });
    getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('soumet le formulaire, affiche succès et redirige vers /suggest', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    setDoc.mockResolvedValueOnce();

    render(<EditProfileStudent />);

    // Remplir tous les champs requis
    await user.type(screen.getByLabelText(/description/i), 'Ma description');
    await user.type(screen.getByLabelText(/type de voie/i), 'Rue');
    await user.type(screen.getByLabelText(/^adresse$/i), '1 rue X');
    await user.type(screen.getByLabelText(/code postal/i), '75000');
    await user.type(screen.getByLabelText(/ville/i), 'Paris');
    await user.type(screen.getByLabelText(/type de cursus/i), 'Master');
    await user.type(screen.getByLabelText(/domaine de compétence/i), 'Web');

    await user.click(screen.getByRole('button', { name: /mettre à jour mon profil/i }));

    expect(await screen.findByText(/profil mis à jour/i)).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/suggest');
  });

  it('affiche une erreur si setDoc échoue et n\'effectue pas la redirection', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    setDoc.mockRejectedValueOnce(new Error('Save error'));

    render(<EditProfileStudent />);

    await user.type(screen.getByLabelText(/description/i), 'Ma description');
    await user.type(screen.getByLabelText(/type de voie/i), 'Rue');
    await user.type(screen.getByLabelText(/^adresse$/i), '1 rue X');
    await user.type(screen.getByLabelText(/code postal/i), '75000');
    await user.type(screen.getByLabelText(/ville/i), 'Paris');
    await user.type(screen.getByLabelText(/type de cursus/i), 'Master');
    await user.type(screen.getByLabelText(/domaine de compétence/i), 'Web');

    await user.click(screen.getByRole('button', { name: /mettre à jour mon profil/i }));

    expect(await screen.findByText(/erreur lors de la sauvegarde/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('rend le composant entreprise si le rôle du doc est company', async () => {
    // getDoc renvoie role company
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'company' }) });

    render(<EditProfileStudent />);
    // Le composant EditProfileCompany affiche "Profil entreprise"
    expect(await screen.findByText(/profil entreprise/i)).toBeInTheDocument();
  });
});

