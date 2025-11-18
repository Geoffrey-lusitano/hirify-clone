// src/components/__tests__/Login.test.js
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Désactiver temporairement les erreurs de console
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('Composant Login - Fonctionnalités', () => {
  it('affiche les champs email et mot de passe', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  it('affiche le bouton de connexion', () => {
    render(<Login />);
    expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
  });

  it('affiche le bouton de création de compte', () => {
    render(<Login />);
    expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
  });

  it('affiche le logo', () => {
    render(<Login />);
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
  });

  it('affiche le titre', () => {
    render(<Login />);
    expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
  });
});

jest.mock('next/link', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('../assets/hirify-logo.svg', () => 'logo.svg');
// Évite d'initialiser Firebase Analytics en test
jest.mock('../../firebase/firebase', () => ({ __esModule: true, app: {} }));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush })
}));

jest.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  __esModule: true,
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn()
}));

// Récupère les fonctions mockées pour les configurer dans les tests
const { signInWithEmailAndPassword } = require('firebase/auth');
const { getDoc } = require('firebase/firestore');

import Login from '../Login';

describe('Composant Login - Logique', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('soumet le formulaire, affiche le chargement puis redirige vers /suggest si description existe', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'uid123' } });
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ description: 'ok' }) });

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'john@doe.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'secret');

    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /connexion en cours/i })).toBeDisabled();
    expect(await screen.findByText(/connexion réussie/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockPush).toHaveBeenCalledWith('/suggest');
  });

  it("redirige vers /profile si l'utilisateur n'a pas de description", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'uid999' } });
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({}) });

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'pwd');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/connexion réussie/i)).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it('affiche une erreur si firebase renvoie une erreur et réactive le bouton', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Auth error'));

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'err@ex.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'bad');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/auth error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).not.toBeDisabled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('n\'envoie pas deux fois si on clique rapidement deux fois sur Se connecter', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'uid-click' } });
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ description: 'ok' }) });

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'john@doe.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'secret');

    const btn = screen.getByRole('button', { name: /se connecter/i });
    await user.click(btn);
    // Le bouton passe en chargement et se désactive
    expect(screen.getByRole('button', { name: /connexion en cours/i })).toBeDisabled();
    // Tentative d'un second clic pendant le chargement
    await user.click(screen.getByRole('button', { name: /connexion en cours/i }));

    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });

  it("redirige vers /profile si le document de l'utilisateur n'existe pas", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'no-doc' } });
    getDoc.mockResolvedValueOnce({ exists: () => false });

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'pwd');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/connexion réussie/i)).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockPush).toHaveBeenCalledWith('/profile');
  });

  it("efface l'erreur après un premier échec puis réussite, et redirige selon la description", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    // 1) Échec
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Auth error'));

    render(<Login />);

    await user.type(screen.getByLabelText(/email/i), 'first@fail.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'bad');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByText(/auth error/i)).toBeInTheDocument();

    // 2) Réussite ensuite
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'uid-after' } });
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ description: 'ok' }) });

    await user.clear(screen.getByLabelText(/email/i));
    await user.clear(screen.getByLabelText(/mot de passe/i));
    await user.type(screen.getByLabelText(/email/i), 'ok@ex.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'good');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(screen.queryByText(/auth error/i)).toBeNull();
    expect(await screen.findByText(/connexion réussie/i)).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockPush).toHaveBeenCalledWith('/suggest');
  });
});