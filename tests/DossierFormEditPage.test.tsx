import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock react-router-dom useParams

// Mock services and hooks
vi.mock('../services/dossierService', () => ({
  getDossierById: vi.fn().mockResolvedValue({
    id: 8,
    numeroDossier: 'DOS-2025-0010',
    origine: 'Chine',
    type: 'D3',
    items: [], prixReviens: [], reglements: [], teus: [],
  }),
  updateDossier: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../hooks/useOrigines', () => ({
  default: () => ({ origines: [{ idOrigine: 2, nomPays: 'Chine' }], loading: false, error: null, fetchOrigines: vi.fn() })
}));

vi.mock('../context/AppContext', () => ({
  useTypeDossiers: () => ({ typeDossiers: [{ id: 7, typeDossier: 'D3' }], fetchTypeDossiers: vi.fn() }),
  useNavires: () => ({ navires: [], fetchNavires: vi.fn() }),
}));

vi.mock('../hooks/useArmateurs', () => ({
  default: () => ({ armateurs: [], loading: false, error: null, fetchArmateurs: vi.fn().mockResolvedValue(undefined) })
}));

const { default: DossierFormEditPage } = await import('../pages/dossiers/DossierFormEditPage');

describe('DossierFormEditPage', () => {
  it('should select origine and type by id when backend returns names', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/dossiers/8"]}>
        <Routes>
          <Route path="/dossiers/:id" element={<DossierFormEditPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const combos = screen.getAllByRole('combobox');
      const selectOrigine = combos.find(c => c.getAttribute('name') === 'origine') as HTMLSelectElement | undefined;
      expect(selectOrigine).toBeTruthy();
      expect(selectOrigine!.value).toBe('2');

      const selectType = combos.find(c => c.getAttribute('name') === 'type') as HTMLSelectElement | undefined;
      expect(selectType).toBeTruthy();
      expect(selectType!.value).toBe('7');
    });
  });
});
