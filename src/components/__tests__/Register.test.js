// src/components/__tests__/register.test.js
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../Register';


// Mock léger d'AddressInput pour éviter les effets externes en test
jest.mock('../AddressInput', () => () => <input data-testid="address-input" />);

describe('Composant Register - Rendu de base', () => {
  it('affiche le titre de création de compte', () => {
    render(<Register />);
    expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
  });

  it('affiche le sélecteur de rôle', () => {
    render(<Register />);
    expect(screen.getByLabelText(/je suis/i)).toBeInTheDocument();
  });

  it('affiche les champs pour étudiant par défaut (Nom, Prénom)', () => {
    render(<Register />);
    // Utiliser un motif exact pour éviter que "Prénom" (qui contient "nom") ne soit matché
    expect(screen.getByLabelText(/^Nom$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
  });

  it('affiche les champs email et mot de passe', () => {
    render(<Register />);
    // Les labels Email/Mot de passe ne sont pas reliés par for/id -> cibler les placeholders
    expect(screen.getByPlaceholderText(/.+@.+\..+/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/•+/)).toBeInTheDocument();
  });

  it("affiche le bouton d'inscription", () => {
    render(<Register />);
    expect(screen.getByText(/s'inscrire/i)).toBeInTheDocument();
  });

  it('affiche le lien de connexion', () => {
    render(<Register />);
    expect(screen.getByText(/connectez-vous/i)).toBeInTheDocument();
  });
});

// Mocks supplémentaires pour la logique
jest.mock('../../firebase/firebase', () => ({ __esModule: true, app: {} }));
jest.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  __esModule: true,
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  Link: ({ to, className, children }) => <a href={to} className={className}>{children}</a>,
}));

const mockNavigate = jest.fn();
const { createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { setDoc } = require('firebase/firestore');

describe('Composant Register - Logique', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('soumet en rôle étudiant, affiche succès et redirige vers /login', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'u1' } });
    updateProfile.mockResolvedValueOnce();
    setDoc.mockResolvedValueOnce();

    render(<Register />);

    // Sélection rôle étudiant (par défaut)
    // Renseigner champs requis
    await user.type(screen.getByLabelText(/^Nom$/i), 'Doe');
    await user.type(screen.getByLabelText(/prénom/i), 'John');
    await user.type(screen.getByPlaceholderText(/votre@email\.com/i), 'john@doe.com');
    await user.type(screen.getByPlaceholderText(/•+/), 'secret123');

    // Soumission
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Bouton en chargement
    expect(screen.getByRole('button', { name: /création en cours/i })).toBeDisabled();
    // Message succès
    expect(await screen.findByText(/compte créé avec succès/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('affiche une erreur si la création échoue et réactive le bouton', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    createUserWithEmailAndPassword.mockRejectedValueOnce(new Error('Register error'));

    render(<Register />);

    await user.type(screen.getByLabelText(/^Nom$/i), 'Doe');
    await user.type(screen.getByLabelText(/prénom/i), 'John');
    await user.type(screen.getByPlaceholderText(/votre@email\.com/i), 'john@doe.com');
    await user.type(screen.getByPlaceholderText(/•+/), 'secret123');

    await user.click(screen.getByRole('button', { name: /s'inscrire/i }));

    expect(await screen.findByText(/register error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).not.toBeDisabled();
  });
});
