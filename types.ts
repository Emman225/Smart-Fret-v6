
export interface DossierItem {
  id: string;
  quantite: number;
  designation: string;
  fob: number;
}

export interface PrixReviensItem {
  id: string;
  designation: string;
  quantite: number;
  fob: number;
  cfa: number;
  percentage: number;
  prixRevient: number;
}

export interface ReglementItem {
  id: string;
  date: string;
  reference: string;
  modePaiement: string;
  banque: string;
  montantDevise: number;
  devise: string;
  coursDevise: number;
  montantCFA: number;
  montantTPS: number;
  fraisBancaires: number;
}

export interface DetailAdministratif {
  nom: string;
  numFacture: string;
  date: string;
  numCC: string;
  montant: number;
  montantTaxable: number;
  montantTVA: number;
}

export interface TEUItem {
  id: string;
  numero: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  contact: string;
  email: string;
  password?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
}

export interface Armateur {
  id: string;
  armateur: string;
  contact: string;
  email: string;
}

export interface Origine {
  id: string;
  nomPays: string;
}

export interface TypeDossier {
  id: string;
  typeDossier: string;
}

export interface Navire {
  id: string;
  nomNavire: string;
  armateurId: string;
  armateurName?: string;
}

export interface CategorieProduit {
  id: string;
  nomCategorie: string;
}

export interface Produit {
  id: string;
  nomProduit: string;
}

export interface Dossier {
  id: string;
  // Section 1: Dossier livraisons
  numeroDossier: string;
  origine: string | { id?: number | string; label?: string; nom?: string };
  numFRI: string;
  numBSC: string;
  montantBSC: number;
  numBL: string;
  date: string;
  armateur: string;
  navire: string;
  dateETA: string;
  numFactureVendeur: string;
  dateFactureVendeur: string;
  montantFacture: number;
  devise: string;
  cours: number;
  montantCFA: number;
  montantAssurance: number;
  incoterm: string;
  type: string | { id?: number | string; libelle?: string; label?: string };
  qte: number;
  nbreTEU: number;
  vendeur: string;
  items: DossierItem[];

  // Section 2: Calcul prix unitaire
  prixReviens: PrixReviensItem[];

  // Section 3: Douanes
  nomTransit: string;
  numFactureTransit: string;
  dateFactureTransit: string;
  montantTransit: number;
  droitDouane: number;
  droitDTaxe: number;
  montantTVADouane: number;
  montantTSDouane: number;
  fraisPhyto: number;
  fraisDepotage: number;
  numCCTransit: string;
  numDosTran: string;
  numDeclarant: string;
  dateDeclarant: string;
  montantTVAFactTrans: number;
  montantTVAInterv: number;

  // Section 4: Détails administratifs
  aconnier: DetailAdministratif;
  fret: DetailAdministratif;
  transport: DetailAdministratif;
  change: DetailAdministratif;
  surestaire: DetailAdministratif;
  magasinage: DetailAdministratif;

  // Section 5: Règlements
  reglements: ReglementItem[];

  // Section 6: T.E.U
  teus: TEUItem[];
}
