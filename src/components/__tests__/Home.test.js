// src/components/__tests__/Home.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../Home';

// Mocks nécessaires pour la logique de navigation
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: mockPush })
}));
jest.mock('../assets/hirify-logo.svg', () => 'logo.svg');
const mockPush = jest.fn();

describe('Composant Home - Rendu de base', () => {
  it('affiche le titre de la navbar', () => {
    render(<Home />);
    expect(screen.getByText('Hirify')).toBeInTheDocument();
  });

  it('affiche le bouton Connexion dans la navbar', () => {
    render(<Home />);
    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
  });

  it('affiche le titre héro', () => {
    render(<Home />);
    expect(screen.getByText(/bienvenue sur hirify/i)).toBeInTheDocument();
  });

  it('affiche le bouton Créer un compte', () => {
    render(<Home />);
    expect(screen.getByText(/créer un compte/i)).toBeInTheDocument();
  });

  it('navigue vers /login quand on clique sur Connexion', async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole('button', { name: /connexion/i }));
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('navigue vers /register quand on clique sur Créer un compte', async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole('button', { name: /créer un compte/i }));
    expect(mockPush).toHaveBeenCalledWith('/register');
  });
});

