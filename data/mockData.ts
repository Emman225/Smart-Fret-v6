
import { Dossier, User, Armateur, Origine, TypeDossier, Navire, CategorieProduit, Produit } from '../types';

const emptyDetailAdministratif = {
    nom: '', numFacture: '', date: '', numCC: '', montant: 0, montantTaxable: 0, montantTVA: 0
};

const baseDossier: Dossier = {
  id: 'dossier_1672532400000',
  numeroDossier: 'DOS-2024-001',
  origine: 'Chine',
  numFRI: 'FRI-123',
  numBSC: 'BSC-456',
  montantBSC: 1500,
  numBL: 'BL-MAEU-123456',
  type: 'D3',
  qte: 100,
  nbreTEU: 2,
  vendeur: 'Alibaba',
  items: [{ id: '1', quantite: 100, designation: 'Électroniques', fob: 50000 }],
  prixReviens: [{ id: '1', designation: 'Électroniques', quantite: 100, fob: 50000, cfa: 30000000, percentage: 10, prixRevient: 330000 }],
  nomTransit: 'Transit Express',
  numFactureTransit: 'TE-2024-1',
  dateFactureTransit: '2024-01-15',
  montantTransit: 5000,
  droitDouane: 2500,
  droitDTaxe: 500,
  montantTVADouane: 1800,
  montantTSDouane: 300,
  fraisPhyto: 0,
  fraisDepotage: 1200,
  numCCTransit: 'CC-TE-1',
  numDosTran: 'DT-TE-1',
  numDeclarant: 'DEC-007',
  dateDeclarant: '2024-01-20',
  montantTVAFactTrans: 900,
  montantTVAInterv: 200,
  aconnier: { ...emptyDetailAdministratif, nom: 'Port Dakar', montant: 800 },
  fret: { ...emptyDetailAdministratif, nom: 'Maersk', montant: 3500 },
  transport: { ...emptyDetailAdministratif, nom: 'Camion Pro', montant: 600 },
  change: { ...emptyDetailAdministratif, nom: 'CBAO', montant: 100 },
  surestaire: { ...emptyDetailAdministratif },
  magasinage: { ...emptyDetailAdministratif, nom: 'Entrepôt Central', montant: 400 },
  reglements: [{id: '1', date: '2024-01-10', reference: 'PAY-001', modePaiement: 'Virement', banque: 'CBAO', montantDevise: 50000, devise: 'USD', coursDevise: 600, montantCFA: 30000000, montantTPS: 0, fraisBancaires: 50}],
  teus: [{ id: '1', numero: 'MSCU1234567' }, { id: '2', numero: 'CMAU7654321' }],
};

export const mockDossiers: Dossier[] = [baseDossier];

const origines = ['Chine', 'Europe', 'USA', 'Turquie', 'Brésil', 'Inde'];
const vendeurs = ['Alibaba', 'Amazon', 'Global Sources', 'Local Supplier', 'TradeKey', 'Made-in-China'];

for (let i = 2; i <= 30; i++) {
    const newDossier: Dossier = {
        ...baseDossier,
        id: `dossier_${Date.now()}_${i}`,
        numeroDossier: `DOS-2024-${String(i).padStart(3, '0')}`,
        origine: origines[(i - 1) % origines.length],
        montantBSC: Math.floor(Math.random() * 5000) + 1000,
        numBL: `BL-CMA-${String(i * 11).padStart(6, '0')}`,
        type: 'D3',
        vendeur: vendeurs[(i - 1) % vendeurs.length],
        items: [{ id: `${i}`, quantite: Math.floor(Math.random() * 200) + 50, designation: `Produit ${i}`, fob: Math.floor(Math.random() * 100000) + 10000 }],
        reglements: [{id: `${i}`, date: `2024-01-${String(i).padStart(2, '0')}`, reference: `PAY-${String(i).padStart(3, '0')}`, modePaiement: 'Virement', banque: 'CBAO', montantDevise: Math.floor(Math.random() * 100000), devise: 'USD', coursDevise: 600, montantCFA: 0, montantTPS: 0, fraisBancaires: Math.floor(Math.random() * 100)}],
        teus: [{ id: `${i}-1`, numero: `TEU-${i}A` }, { id: `${i}-2`, numero: `TEU-${i}B` }],
    };
    mockDossiers.push(newDossier);
}

export const mockUsers: User[] = [
    { id: 'user_1', username: 'a', fullName: 'Admin Principal', contact: '771234567', email: 'admin@smartfret.com', password: 'a' },
    { id: 'user_2', username: 'jdupont', fullName: 'Jean Dupont', contact: '781112233', email: 'j.dupont@email.com', password: 'password123' },
    { id: 'user_3', username: 'amartin', fullName: 'Alice Martin', contact: '765554433', email: 'a.martin@email.com', password: 'password123' },
    { id: 'user_4', username: 'bsow', fullName: 'Binta Sow', contact: '778889900', email: 'b.sow@email.com', password: 'password123' },
    { id: 'user_5', username: 'cdiop', fullName: 'Cheikh Diop', contact: '701239876', email: 'c.diop@email.com', password: 'password123' },
];

export const mockArmateurs: Armateur[] = [
    { id: 'arm_1', armateur: 'Maersk Line', contact: '77 111 22 33', email: 'contact@maersk.com' },
    { id: 'arm_2', armateur: 'CMA CGM', contact: '78 222 33 44', email: 'info@cma-cgm.com' },
    { id: 'arm_3', armateur: 'MSC', contact: '76 333 44 55', email: 'support@msc.com' },
    { id: 'arm_4', armateur: 'COSCO Shipping Lines', contact: '70 444 55 66', email: 'service@cosco.com' },
    { id: 'arm_5', armateur: 'Hapag-Lloyd', contact: '77 555 66 77', email: 'contact@hlag.com' },
];

export const mockOrigines: Origine[] = [
    { id: 'orig_1', nomPays: 'Chine' },
    { id: 'orig_2', nomPays: 'Europe' },
    { id: 'orig_3', nomPays: 'USA' },
    { id: 'orig_4', nomPays: 'Turquie' },
    { id: 'orig_5', nomPays: 'Brésil' },
    { id: 'orig_6', nomPays: 'Inde' },
];

export const mockTypeDossiers: TypeDossier[] = [
    { id: 'td_1', typeDossier: 'D3' },
    { id: 'td_2', typeDossier: 'Importation Standard' },
    { id: 'td_3', typeDossier: 'Exportation' },
    { id: 'td_4', typeDossier: 'Transit' },
    { id: 'td_5', typeDossier: 'Admission Temporaire' },
];

export const mockNavires: Navire[] = [
    { id: 'nav_1', nomNavire: 'Maersk Honam', armateurId: 'arm_1' },
    { id: 'nav_2', nomNavire: 'CMA CGM Antoine de Saint Exupéry', armateurId: 'arm_2' },
    { id: 'nav_3', nomNavire: 'MSC Gülsün', armateurId: 'arm_3' },
    { id: 'nav_4', nomNavire: 'COSCO Shipping Universe', armateurId: 'arm_4' },
    { id: 'nav_5', nomNavire: 'Ever Golden', armateurId: 'arm_1' },
    { id: 'nav_6', nomNavire: 'HMM Algeciras', armateurId: 'arm_2' },
];

export const mockCategorieProduits: CategorieProduit[] = [
    { id: 'catp_1', nomCategorie: 'Électronique' },
    { id: 'catp_2', nomCategorie: 'Alimentaire' },
    { id: 'catp_3', nomCategorie: 'Textile' },
    { id: 'catp_4', nomCategorie: 'Matériaux de construction' },
    { id: 'catp_5', nomCategorie: 'Produits chimiques' },
];

export const mockProduits: Produit[] = [
    { id: 'prod_1', nomProduit: 'Riz Parfumé' },
    { id: 'prod_2', nomProduit: 'Sucre en Poudre' },
    { id: 'prod_3', nomProduit: 'Huile Végétale' },
    { id: 'prod_4', nomProduit: 'Farine de Blé' },
    { id: 'prod_5', nomProduit: 'Thé Vert de Chine' },
    { id: 'prod_6', nomProduit: 'Pattes Alimentaires' },
];