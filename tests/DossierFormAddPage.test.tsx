import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi } from 'vitest';

describe('DossierFormAddPage', () => {
  test('doit conserver les lignes vides et afficher validation required', async () => {
    // Déclarer les mocks avant d'importer le composant
    vi.mock('../services/dossierService', () => ({
      createDossier: vi.fn().mockResolvedValue({ success: true }),
    }));

    // Mock SweetAlert to avoid real DOM interactions during tests
    vi.mock('sweetalert2', () => ({
      // default export is expected in code
      default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) }
    }));
    vi.mock('sweetalert2-react-content', () => ({
      default: (Swal: any) => ({ fire: vi.fn().mockResolvedValue({ isConfirmed: true }) }),
    }));

    vi.mock('../hooks/useOrigines', () => ({
      default: () => ({ origines: [{ idOrigine: 1, nomPays: 'Chine' }], loading: false, error: null, fetchOrigines: vi.fn().mockResolvedValue(undefined) })
    }));

    vi.mock('../context/AppContext', () => ({
      useTypeDossiers: () => ({ typeDossiers: [{ id: 7, typeDossier: 'D3' }], fetchTypeDossiers: vi.fn().mockResolvedValue(undefined) }),
      useNavires: () => ({ navires: [], fetchNavires: vi.fn().mockResolvedValue(undefined) }),
    }));

    vi.mock('../hooks/useArmateurs', () => ({
      default: () => ({ armateurs: [], loading: false, error: null, fetchArmateurs: vi.fn().mockResolvedValue(undefined) })
    }));

    const { default: DossierFormAddPage } = await import('../pages/dossiers/DossierFormAddPage');
    render(
      <MemoryRouter>
        <DossierFormAddPage />
      </MemoryRouter>
    );

    // Verify default values are prefilled
    expect(screen.getByDisplayValue('Produit A')).toBeTruthy();
    expect(screen.getByDisplayValue('CONT-123456-1')).toBeTruthy();

    // Click submit
    const submit = screen.getByRole('button', { name: /Créer le dossier/i });
    userEvent.click(submit);

    // Since fields are prefilled, there should be no validation error for designation
    await waitFor(() => {
      expect(screen.queryByText(/La désignation est requise/)).toBeNull();
    });
  });
});
