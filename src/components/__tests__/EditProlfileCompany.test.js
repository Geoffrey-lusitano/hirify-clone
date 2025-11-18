// src/components/__tests__/EditProlfileCompany.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mocks Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  deleteUser: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

import { getAuth } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

import EditProfileCompany from '../EditProfileCompany';

describe('Composant EditProfileCompany - Rendu de base', () => {
  beforeEach(() => {
    // Utilisateur connecté par défaut
    getAuth.mockReturnValue({
      currentUser: { uid: 'c1', displayName: 'Acme Corp', email: 'contact@acme.com' },
    });
    // Doc inexistant ou sans alternants => état initial par défaut
    getDoc.mockResolvedValue({ exists: () => false, data: () => ({}) });
  });

  it("affiche le titre et le nom de l'entreprise", async () => {
    render(<EditProfileCompany />);
    expect(await screen.findByText(/profil entreprise/i)).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('affiche les principaux champs de formulaire et actions', async () => {
    render(<EditProfileCompany />);
    // Champs d'adresse et description
    expect(await screen.findByLabelText(/description de l'entreprise/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type de voie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^adresse$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/code postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ville/i)).toBeInTheDocument();

    // Section alternants
    expect(screen.getByText(/type d'alternant\(s\) recherché\(s\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type de formation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/domaine recherché/i)).toBeInTheDocument();

    // Boutons
    expect(screen.getByText(/\+ ajouter un type d'alternant/i)).toBeInTheDocument();
    expect(screen.getByText(/mettre à jour mon profil/i)).toBeInTheDocument();
    expect(screen.getByText(/supprimer mon compte/i)).toBeInTheDocument();
  });
});

describe('Composant EditProfileCompany - Utilisateur non connecté', () => {
  it('affiche un message demandant la connexion', () => {
    getAuth.mockReturnValue({ currentUser: null });
    render(<EditProfileCompany />);
    expect(screen.getByText(/veuillez vous connecter\./i)).toBeInTheDocument();
  });
});

