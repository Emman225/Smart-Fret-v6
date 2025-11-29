/**
 * Objet complet pour l'enregistrement d'un dossier
 * Basé sur le formulaire DossierFormPage.tsx
 */

import { Dossier, DossierItem, PrixReviensItem, ReglementItem, DetailAdministratif, TEUItem } from './types';

/**
 * Objet Dossier complet avec toutes les sections remplies
 * Cet objet peut être utilisé directement pour créer ou mettre à jour un dossier
 */
export const exempleDossierComplet: Omit<Dossier, 'id'> = {
  // ============================================
  // SECTION 1: DOSSIER LIVRAISON
  // ============================================
  numeroDossier: "DOS-2024-001",
  origine: "Chine",
  numFRI: "FRI-123456",
  numBSC: "BSC-789012",
  montantBSC: 15000.50,
  numBL: "BL-MAEU-1234567",
  type: "D3",
  qte: 100,
  nbreTEU: 2,
  vendeur: "Alibaba Group",
  
  // Items du dossier (liste des produits)
  items: [
    {
      id: "item_1",
      quantite: 50,
      designation: "Électroniques - Smartphones",
      fob: 25000.00
    },
    {
      id: "item_2",
      quantite: 30,
      designation: "Accessoires téléphoniques",
      fob: 5000.00
    },
    {
      id: "item_3",
      quantite: 20,
      designation: "Câbles et chargeurs",
      fob: 2000.00
    }
  ] as DossierItem[],

  // ============================================
  // SECTION 2: CALCUL PRIX UNITAIRE
  // ============================================
  prixReviens: [
    {
      id: "prix_1",
      designation: "Électroniques - Smartphones",
      quantite: 50,
      fob: 25000.00,
      cfa: 15000000.00,
      percentage: 10.5,
      prixRevient: 16575000.00
    },
    {
      id: "prix_2",
      designation: "Accessoires téléphoniques",
      quantite: 30,
      fob: 5000.00,
      cfa: 3000000.00,
      percentage: 8.0,
      prixRevient: 3240000.00
    }
  ] as PrixReviensItem[],

  // ============================================
  // SECTION 3: DOUANES
  // ============================================
  nomTransit: "Transit Express Sénégal",
  numFactureTransit: "TE-2024-001",
  dateFactureTransit: "2024-01-15",
  montantTransit: 5000.00,
  droitDouane: 2500.00,
  droitDTaxe: 500.00,
  montantTVADouane: 1800.00,
  montantTSDouane: 300.00,
  fraisPhyto: 0.00,
  fraisDepotage: 1200.00,
  numCCTransit: "CC-TE-2024-001",
  numDosTran: "DT-TE-2024-001",
  numDeclarant: "DEC-007",
  dateDeclarant: "2024-01-20",
  montantTVAFactTrans: 900.00,
  montantTVAInterv: 200.00,

  // ============================================
  // SECTION 4: DÉTAILS ADMINISTRATIFS
  // ============================================
  aconnier: {
    nom: "Port Autonome de Dakar",
    numFacture: "AC-2024-001",
    date: "2024-01-10",
    numCC: "CC-AC-001",
    montant: 800.00,
    montantTaxable: 750.00,
    montantTVA: 150.00
  } as DetailAdministratif,

  fret: {
    nom: "Maersk Line",
    numFacture: "FR-2024-001",
    date: "2024-01-12",
    numCC: "CC-FR-001",
    montant: 3500.00,
    montantTaxable: 3500.00,
    montantTVA: 0.00
  } as DetailAdministratif,

  transport: {
    nom: "Camion Pro Transport",
    numFacture: "TR-2024-001",
    date: "2024-01-18",
    numCC: "CC-TR-001",
    montant: 600.00,
    montantTaxable: 600.00,
    montantTVA: 108.00
  } as DetailAdministratif,

  change: {
    nom: "CBAO - Bureau de Change",
    numFacture: "CH-2024-001",
    date: "2024-01-08",
    numCC: "CC-CH-001",
    montant: 100.00,
    montantTaxable: 100.00,
    montantTVA: 18.00
  } as DetailAdministratif,

  surestaire: {
    nom: "Surestaire Services",
    numFacture: "SU-2024-001",
    date: "2024-01-14",
    numCC: "CC-SU-001",
    montant: 400.00,
    montantTaxable: 400.00,
    montantTVA: 72.00
  } as DetailAdministratif,

  magasinage: {
    nom: "Entrepôt Central Dakar",
    numFacture: "MG-2024-001",
    date: "2024-01-16",
    numCC: "CC-MG-001",
    montant: 400.00,
    montantTaxable: 400.00,
    montantTVA: 72.00
  } as DetailAdministratif,

  // ============================================
  // SECTION 5: RÈGLEMENTS
  // ============================================
  reglements: [
    {
      id: "reg_1",
      date: "2024-01-10",
      reference: "PAY-2024-001",
      modePaiement: "Virement",
      banque: "CBAO",
      montantDevise: 50000.00,
      devise: "USD",
      coursDevise: 600.00,
      montantCFA: 30000000.00,
      montantTPS: 0.00,
      fraisBancaires: 50.00
    },
    {
      id: "reg_2",
      date: "2024-01-25",
      reference: "PAY-2024-002",
      modePaiement: "Chèque",
      banque: "SGBS",
      montantDevise: 20000.00,
      devise: "EUR",
      coursDevise: 650.00,
      montantCFA: 13000000.00,
      montantTPS: 0.00,
      fraisBancaires: 25.00
    }
  ] as ReglementItem[],

  // ============================================
  // SECTION 6: T.E.U (Conteneurs)
  // ============================================
  teus: [
    {
      id: "teu_1",
      numero: "MSCU1234567"
    },
    {
      id: "teu_2",
      numero: "CMAU7654321"
    }
  ] as TEUItem[]
};

/**
 * Objet Dossier minimal (avec valeurs par défaut)
 * Utile pour créer un nouveau dossier vide
 */
export const dossierVide: Omit<Dossier, 'id'> = {
  numeroDossier: "",
  origine: "Chine",
  numFRI: "",
  numBSC: "",
  montantBSC: 0,
  numBL: "",
  type: "D3",
  qte: 0,
  nbreTEU: 0,
  vendeur: "",
  items: [{ id: "1", quantite: 0, designation: "", fob: 0 }],
  prixReviens: [{ id: "1", designation: "", quantite: 0, fob: 0, cfa: 0, percentage: 0, prixRevient: 0 }],
  nomTransit: "",
  numFactureTransit: "",
  dateFactureTransit: "",
  montantTransit: 0,
  droitDouane: 0,
  droitDTaxe: 0,
  montantTVADouane: 0,
  montantTSDouane: 0,
  fraisPhyto: 0,
  fraisDepotage: 0,
  numCCTransit: "",
  numDosTran: "",
  numDeclarant: "",
  dateDeclarant: "",
  montantTVAFactTrans: 0,
  montantTVAInterv: 0,
  aconnier: { nom: "", numFacture: "", date: "", numCC: "", montant: 0, montantTaxable: 0, montantTVA: 0 },
  fret: { nom: "", numFacture: "", date: "", numCC: "", montant: 0, montantTaxable: 0, montantTVA: 0 },
  transport: { nom: "", numFacture: "", date: "", numCC: "", montant: 0, montantTaxable: 0, montantTVA: 0 },
  change: { nom: "", numFacture: "", date: "", numCC: "", montant: 0, montantTaxable: 0, montantTVA: 0 },
  surestaire: { nom: "", numFacture: "", date: "", numCC: "", montant: 0, montantTaxable: 0, montantTVA: 0 },
  magasinage: { nom: "", numFacture: "", date: "", numCC: "", montant: 0, montantTaxable: 0, montantTVA: 0 },
  reglements: [],
  teus: [{ id: "1", numero: "" }]
};

/**
 * Fonction utilitaire pour préparer les données avant l'envoi à l'API
 * Supprime les IDs temporaires et nettoie les données
 */
export function preparerDossierPourAPI(dossier: Omit<Dossier, 'id'>): any {
  return {
    ...dossier,
    // Supprimer les IDs temporaires des items
    items: dossier.items.map(({ id, ...item }) => item),
    prixReviens: dossier.prixReviens.map(({ id, ...item }) => item),
    reglements: dossier.reglements.map(({ id, ...item }) => item),
    teus: dossier.teus.map(({ id, ...item }) => item)
  };
}

/**
 * Exemple d'utilisation pour créer un dossier via l'API
 */
export async function creerDossierAPI(dossier: Omit<Dossier, 'id'>) {
  const donneesPreparees = preparerDossierPourAPI(dossier);
  
  // Exemple avec fetch
  const response = await fetch('/api/dossiers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(donneesPreparees)
  });
  
  return response.json();
}

/**
 * Exemple d'utilisation pour mettre à jour un dossier via l'API
 */
export async function mettreAJourDossierAPI(id: string, dossier: Omit<Dossier, 'id'>) {
  const donneesPreparees = preparerDossierPourAPI(dossier);
  
  const response = await fetch(`/api/dossiers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(donneesPreparees)
  });
  
  return response.json();
}

