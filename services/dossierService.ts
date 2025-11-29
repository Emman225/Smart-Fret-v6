import axios from '../lib/axios';
import { getAuthHeader } from '../utils/auth';
import { Dossier, DossierItem, PrixReviensItem, ReglementItem, DetailAdministratif, TEUItem } from '../types';

const API_BASE_URL = '/dossiers';

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from?: number;
    to?: number;
  };
}

// Interface pour la réponse API standard
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

// Interface pour les données brutes du backend (ancienne API)
interface BackendDossier {
  IdDossier?: number | null;
  NumDossier: string;
  IdTypeDos: number;
  NumFRI: string | null;
  DAINumACIAB: string | null;
  NumBSC: string | null;
  MontBSC: string | null;
  Qte: number;
  NbreTEU: number;
  NomVendeur: string | null;
  NumBL: string | null;
  DateBL: string | null;
  NumFactVend: string | null;
  MontFactVend: string | null;
  DatFactVendeur: string | null;
  DatETA: string | null;
  Devise: string | null;
  CoursDevise: string | null;
  MontCFA: string | null;
  NomSurrest: string | null;
  MontAssur: string | null;
  DateSurrest: string | null;
  MontSurrest: string | null;
  MonttaxabSurrest: string | null;
  MontTVASurrest: string | null;
  NomMag: string | null;
  NumFactMag: string | null;
  DateMag: string | null;
  MontMag: string | null;
  MontTaxabMag: string | null;
  MontTVAMag: string | null;
  NomAccon: string | null;
  NumFactAccon: string | null;
  DateAccon: string | null;
  NumCCAccon: string | null;
  MontAccon: string | null;
  MontTaxabAccon: string | null;
  MontTVAAccon: string | null;
  NomFret: string | null;
  NumFactFret: string | null;
  DateFret: string | null;
  MontFret: string | null;
  NumCCFret: string | null;
  MontTaxabFret: string | null;
  MontTVAFret: string | null;
  NomTransp: string | null;
  NumFactTransp: string | null;
  DateTransp: string | null;
  MontTransp: string | null;
  MontTaxabTransp: string | null;
  MontTVATransp: string | null;
  NomChang: string | null;
  NumFactChang: string | null;
  DateChang: string | null;
  MontChang: string | null;
  MontTaxabChang: string | null;
  MontTVAChang: string | null;
  NomTrans: string | null;
  NumFactTrans: string | null;
  DateTrans: string | null;
  NumDeclarTrans: string | null;
  MontTrans: string | null;
  MontIntervTrans: string | null;
  DateDeclarTrans: string | null;
  FraisDepotagTrans: string | null;
  MontTVAIntervDouan: string | null;
  DroitDoua: string | null;
  DroitTaxDoua: string | null;
  NumDossierDoua: string | null;
  NumCCDoua: string | null;
  FraisPhytoDoua: string | null;
  MontTVADoua: string | null;
  MontSTDoua: string | null;
  Designation: string | null;
  IdOrigine: number;
  IdArmat?: number | null;
  IdNavire?: number | null;
  Navire: string | null;
  Armateur: string | null;
  Incoterm: number | null;
  created_at: string | null;
  updated_at: string | null;
  type_dossier?: {
    IdType: number;
    LibType: string;
  };
  origine?: {
    IdOrigine: number;
    NomPays: string;
  };
  designations?: Array<{
    IdDesig?: number;
    LibelleDesig: string;
    QteDesig: string;
    FOBDesig: string;
  }>;
  prix_unitaires?: Array<{
    IdPU?: number;
    DesignPU: string;
    QtePU: number;
    FOBDevisePU: string;
    CFA_Abidjan: string;
    Pour100: string;
    Revient: string;
  }>;
  reglements?: Array<{
    IdReglt?: number;
    DateReglt: string;
    RefReglt: string;
    ModeReglt: string;
    BanqReglt: string;
    MontReglt: string;
    DeviseReglt: string;
    CoursDevisReglt: string;
    MontCFAReglt: string;
    MontTpsReglt: number;
    FraisBanqReglt: number;
  }>;
  conteneurs?: Array<{
    IdConteiner?: number;
    NumConteiner: string;
  }>;
}

// Interface pour la nouvelle API REST
interface RestBackendDossier {
  id?: number | string;
  numeroDossier?: string;
  origine?: string | {
    id?: number | string;
    nom?: string;
    label?: string;
    name?: string;
  };
  numFRI?: string | null;
  numBSC?: string | null;
  montantBSC?: string | number | null;
  numBL?: string | null;
  type?: string | {
    id?: number | string;
    libelle?: string;
    label?: string;
    name?: string;
  } | null;
  qte?: string | number | null;
  nbreTEU?: string | number | null;
  vendeur?: string | null;
  items?: Array<{
    id?: number | string;
    quantite?: string | number | null;
    designation?: string | null;
    fob?: string | number | null;
  }>;
  prixReviens?: Array<{
    id?: number | string;
    designation?: string | null;
    quantite?: string | number | null;
    fob?: string | number | null;
    cfa?: string | number | null;
    percentage?: string | number | null;
    prixRevient?: string | number | null;
  }>;
  nomTransit?: string | null;
  numFactureTransit?: string | null;
  dateFactureTransit?: string | null;
  montantTransit?: string | number | null;
  droitDouane?: string | number | null;
  droitDTaxe?: string | number | null;
  montantTVADouane?: string | number | null;
  montantTSDouane?: string | number | null;
  fraisPhyto?: string | number | null;
  fraisDepotage?: string | number | null;
  numCCTransit?: string | null;
  numDosTran?: string | null;
  numDeclarant?: string | null;
  dateDeclarant?: string | null;
  montantTVAFactTrans?: string | number | null;
  montantTVAInterv?: string | number | null;
  aconnier?: Partial<DetailAdministratif>;
  fret?: Partial<DetailAdministratif>;
  transport?: Partial<DetailAdministratif>;
  change?: Partial<DetailAdministratif>;
  surestaire?: Partial<DetailAdministratif>;
  magasinage?: Partial<DetailAdministratif>;
  reglements?: Array<{
    id?: number | string;
    date?: string | null;
    reference?: string | null;
    modePaiement?: string | null;
    banque?: string | null;
    montantDevise?: string | number | null;
    devise?: string | null;
    coursDevise?: string | number | null;
    montantCFA?: string | number | null;
    montantTPS?: string | number | null;
    fraisBancaires?: string | number | null;
  }>;
  teus?: Array<{
    id?: number | string;
    numero?: string | null;
  }>;
  [key: string]: any;
}

/**
 * Convertit un nombre string/number en number, retourne 0 si null ou invalide
 */
const parseNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Retourne la première valeur définie parmi plusieurs clés dans un objet
 */
const getFirst = (obj: any, ...keys: string[]) => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const v = obj[k];
      if (v !== undefined && v !== null) return v;
    }
  }
  return undefined;
};

const getFirstString = (obj: any, ...keys: string[]) => {
  const v = getFirst(obj, ...keys);
  return v === undefined || v === null ? '' : String(v);
};

const getFirstNumber = (obj: any, ...keys: string[]) => {
  const v = getFirst(obj, ...keys);
  return parseNumber(v as any);
};

const toNumericId = (value: string | number | null | undefined): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const mapRestDetail = (detail?: Partial<DetailAdministratif>): DetailAdministratif => ({
  nom: detail?.nom || '',
  numFacture: detail?.numFacture || '',
  date: detail?.date || '',
  numCC: detail?.numCC || '',
  montant: parseNumber(detail?.montant),
  montantTaxable: parseNumber(detail?.montantTaxable),
  montantTVA: parseNumber(detail?.montantTVA),
});

const toExistingNumericId = (value: string | number | undefined): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const isLegacyBackendDossier = (backend: any): backend is BackendDossier =>
  backend && (Object.prototype.hasOwnProperty.call(backend, 'IdDossier') || Object.prototype.hasOwnProperty.call(backend, 'NumDossier'));

/**
 * Convertit les données backend (ancienne API) en format frontend
 */
const mapLegacyBackendToFrontend = (backend: BackendDossier): Dossier => {
  return {
    id: backend.IdDossier?.toString() || '0',
    numeroDossier: getFirstString(backend, 'NumDossier', 'numeroDossier'),
    origine: getFirstString(backend, 'IdOrigine', 'origine'),
    numFRI: getFirstString(backend, 'NumFRI', 'numFRI'),
    numBSC: getFirstString(backend, 'NumBSC', 'numBSC'),
    montantBSC: getFirstNumber(backend, 'MontBSC', 'montantBSC'),
    numBL: getFirstString(backend, 'NumBL', 'numBL'),
    date: getFirstString(backend, 'DateBL', 'date'),
    armateur: backend.IdArmat?.toString() || '',
    navire: backend.IdNavire?.toString() || '',
    dateETA: getFirstString(backend, 'DatETA', 'dateETA'),
    numFactureVendeur: getFirstString(backend, 'NumFactVend', 'numFactureVendeur'),
    dateFactureVendeur: getFirstString(backend, 'DatFactVendeur', 'dateFactureVendeur'),
    montantFacture: getFirstNumber(backend, 'MontFactVend', 'montantFacture'),
    devise: getFirstString(backend, 'Devise', 'devise'),
    cours: getFirstNumber(backend, 'CoursDevise', 'cours'),
    montantCFA: getFirstNumber(backend, 'MontCFA', 'montantCFA'),
    montantAssurance: getFirstNumber(backend, 'MontAssur', 'montantAssurance'),
    incoterm: getFirstString(backend, 'Incoterm', 'incoterm'),
    type: backend.IdTypeDos?.toString() || '',
    qte: getFirstNumber(backend, 'Qte', 'qte'),
    nbreTEU: getFirstNumber(backend, 'NbreTEU', 'nbreTEU'),
    vendeur: getFirstString(backend, 'NomVendeur', 'vendeur'),
    items: ((backend as any).designations || (backend as any).items || []).map((e: any) => ({
      id: e.IdDesig !== undefined ? `legacy-${e.IdDesig}` : e.id !== undefined ? String(e.id) : '',
      quantite: parseNumber(getFirst(e, 'QteDesig', 'quantite', 'Qte')),
      designation: getFirstString(e, 'LibelleDesig', 'designation', 'DesignPU'),
      fob: parseNumber(getFirst(e, 'FOBDesig', 'fob', 'FOBDevisePU')),
    })),
    prixReviens: ((backend as any).prix_unitaires || (backend as any).prixReviens || []).map((pu: any) => ({
      id: pu.IdPU !== undefined ? `legacy-${pu.IdPU}` : pu.id !== undefined ? String(pu.id) : '',
      designation: getFirstString(pu, 'DesignPU', 'designation'),
      quantite: parseNumber(getFirst(pu, 'QtePU', 'quantite')),
      fob: parseNumber(getFirst(pu, 'FOBDevisePU', 'fob')),
      cfa: parseNumber(getFirst(pu, 'CFA_Abidjan', 'cfa')),
      percentage: parseNumber(getFirst(pu, 'Pour100', 'percentage')),
      prixRevient: parseNumber(getFirst(pu, 'Revient', 'prixRevient')),
    })),
    nomTransit: backend.NomTrans || '',
    numFactureTransit: backend.NumFactTrans || '',
    dateFactureTransit: backend.DateTrans || '',
    montantTransit: parseNumber(backend.MontTrans),
    droitDouane: parseNumber(backend.DroitDoua),
    droitDTaxe: parseNumber(backend.DroitTaxDoua),
    montantTVADouane: parseNumber(backend.MontTVADoua),
    montantTSDouane: parseNumber(backend.MontSTDoua),
    fraisPhyto: parseNumber(backend.FraisPhytoDoua),
    fraisDepotage: parseNumber(backend.FraisDepotagTrans),
    numCCTransit: backend.NumCCDoua || '',
    numDosTran: backend.NumDossierDoua || '',
    numDeclarant: backend.NumDeclarTrans || '',
    dateDeclarant: backend.DateDeclarTrans || '',
    montantTVAFactTrans: parseNumber(backend.MontTVAIntervDouan),
    montantTVAInterv: parseNumber(backend.MontIntervTrans),
    aconnier: {
      nom: backend.NomAccon || '',
      numFacture: backend.NumFactAccon || '',
      date: backend.DateAccon || '',
      numCC: backend.NumCCAccon || '',
      montant: parseNumber(backend.MontAccon),
      montantTaxable: parseNumber(backend.MontTaxabAccon),
      montantTVA: parseNumber(backend.MontTVAAccon),
    },
    fret: {
      nom: backend.NomFret || '',
      numFacture: backend.NumFactFret || '',
      date: backend.DateFret || '',
      numCC: backend.NumCCFret || '',
      montant: parseNumber(backend.MontFret),
      montantTaxable: parseNumber(backend.MontTaxabFret),
      montantTVA: parseNumber(backend.MontTVAFret),
    },
    transport: {
      nom: backend.NomTransp || '',
      numFacture: backend.NumFactTransp || '',
      date: backend.DateTransp || '',
      numCC: getFirstString(backend, 'numCCTransp', 'NumCCTransp'),
      montant: parseNumber(backend.MontTransp),
      montantTaxable: parseNumber(backend.MontTaxabTransp),
      montantTVA: parseNumber(backend.MontTVATransp),
    },
    change: {
      nom: getFirstString(backend, 'NomChang', 'nomChang'),
      numFacture: getFirstString(backend, 'NumFactChang', 'numFactChang'),
      date: getFirstString(backend, 'DateChang', 'dateChang'),
      numCC: getFirstString(backend, 'NumCCChang', 'numCCChang'),
      montant: getFirstNumber(backend, 'MontChang', 'montChang'),
      montantTaxable: getFirstNumber(backend, 'MontTaxabChang', 'montTaxabChang'),
      montantTVA: getFirstNumber(backend, 'MontTVAChang', 'montTVAChang'),
    },
    surestaire: {
      nom: getFirstString(backend, 'NomSurrest', 'nomSurrest'),
      numFacture: getFirstString(backend, 'numFactureSurrest', 'NumFactSurrest'),
      date: getFirstString(backend, 'DateSurrest', 'dateSurrest'),
      numCC: getFirstString(backend, 'numCCSurrest', 'NumCCSurrest'),
      montant: getFirstNumber(backend, 'MontSurrest', 'montSurrest'),
      montantTaxable: getFirstNumber(backend, 'MonttaxabSurrest', 'montTaxabSurrest'),
      montantTVA: getFirstNumber(backend, 'MontTVASurrest', 'montTVASurrest'),
    },
    magasinage: {
      nom: getFirstString(backend, 'NomMag', 'nomMag'),
      numFacture: getFirstString(backend, 'NumFactMag', 'numFactMag'),
      date: getFirstString(backend, 'DateMag', 'dateMag'),
      numCC: getFirstString(backend, 'numCCMag', 'NumCCMag'),
      montant: getFirstNumber(backend, 'MontMag', 'montMag'),
      montantTaxable: getFirstNumber(backend, 'MontTaxabMag', 'montTaxabMag'),
      montantTVA: getFirstNumber(backend, 'MontTVAMag', 'montTVAMag'),
    },
    reglements: ((backend as any).reglements || []).map((reg: any) => ({
      id: reg.IdReglt !== undefined ? `legacy-${reg.IdReglt}` : reg.id !== undefined ? String(reg.id) : '',
      date: getFirstString(reg, 'DateReglt', 'date'),
      reference: getFirstString(reg, 'RefReglt', 'reference'),
      modePaiement: getFirstString(reg, 'ModeReglt', 'modePaiement'),
      banque: getFirstString(reg, 'BanqReglt', 'banque'),
      montantDevise: parseNumber(getFirst(reg, 'MontReglt', 'montantDevise')),
      devise: getFirstString(reg, 'DeviseReglt', 'devise'),
      coursDevise: parseNumber(getFirst(reg, 'CoursDevisReglt', 'coursDevise')),
      montantCFA: parseNumber(getFirst(reg, 'MontCFAReglt', 'montantCFA')),
      montantTPS: parseNumber(getFirst(reg, 'MontTpsReglt', 'montantTPS')),
      fraisBancaires: parseNumber(getFirst(reg, 'FraisBanqReglt', 'fraisBancaires')),
    })),
    teus: ((backend as any).conteneurs || (backend as any).teus || []).map((cont: any) => ({
      id: cont.IdConteiner !== undefined ? `legacy-${cont.IdConteiner}` : cont.id !== undefined ? String(cont.id) : '',
      numero: getFirstString(cont, 'NumConteiner', 'numero'),
    })),
  };
};

/**
 * Convertit les données backend (nouvelle API REST) en format frontend
 */
export const mapRestBackendToFrontend = (backend: RestBackendDossier): Dossier => {
  return {
    id: backend.id?.toString() || '0',
    numeroDossier: backend.numeroDossier || '',
    origine: ((): string => {
      const o = backend.origine;
      if (o === undefined || o === null) return '';
      if (typeof o === 'object') return (o.nom || o.label || o.name || String((o as any).id || ''));
      return String(o || '');
    })(),
    numFRI: getFirstString(backend, 'numFRI', 'NumFRI'),
    numBSC: getFirstString(backend, 'numBSC', 'NumBSC'),
    montantBSC: getFirstNumber(backend, 'montantBSC', 'MontBSC'),
    numBL: getFirstString(backend, 'numBL', 'NumBL'),
    date: getFirstString(backend, 'date', 'DateBL'),
    armateur: ((): string => {
      const id = getFirst(backend, 'IdArmat', 'idArmateur');
      if (id !== undefined && id !== null && String(id).trim() !== '') return String(id);
      return getFirstString(backend, 'armateur', 'Armateur');
    })(),
    navire: ((): string => {
      const id = getFirst(backend, 'IdNavire', 'idNavire');
      if (id !== undefined && id !== null && String(id).trim() !== '') return String(id);
      return getFirstString(backend, 'navire', 'Navire');
    })(),
    dateETA: getFirstString(backend, 'dateETA', 'DatETA'),
    numFactureVendeur: getFirstString(backend, 'numFactureVendeur', 'NumFactVend'),
    dateFactureVendeur: getFirstString(backend, 'dateFactureVendeur', 'DatFactVendeur'),
    montantFacture: getFirstNumber(backend, 'montantFacture', 'MontFactVend'),
    devise: getFirstString(backend, 'devise', 'Devise'),
    cours: getFirstNumber(backend, 'cours', 'CoursDevise'),
    montantCFA: getFirstNumber(backend, 'montantCFA', 'MontCFA'),
    montantAssurance: getFirstNumber(backend, 'montantAssurance', 'MontAssur'),
    incoterm: getFirstString(backend, 'incoterm', 'Incoterm'),
    type: ((): string => {
      const t = backend.type;
      if (t === undefined || t === null) return '';
      if (typeof t === 'object') return (t.libelle || t.label || t.name || String((t as any).id || ''));
      return String(t || '');
    })(),
    qte: getFirstNumber(backend, 'qte', 'Qte'),
    nbreTEU: getFirstNumber(backend, 'nbreTEU', 'NbreTEU'),
    vendeur: getFirstString(backend, 'vendeur', 'NomVendeur'),
    items: (backend.items || []).map((item) => ({
      id: item.id?.toString() || '',
      quantite: parseNumber(item.quantite),
      designation: item.designation || '',
      fob: parseNumber(item.fob),
    })),
    prixReviens: (backend.prixReviens || []).map((pr) => ({
      id: pr.id?.toString() || '',
      designation: pr.designation || '',
      quantite: parseNumber(pr.quantite),
      fob: parseNumber(pr.fob),
      cfa: parseNumber(pr.cfa),
      percentage: parseNumber(pr.percentage),
      prixRevient: parseNumber(pr.prixRevient),
    })),
    // Douanes - accepter plusieurs alias possibles
    nomTransit: getFirstString(backend, 'nomTransit', 'nomTrans', 'nom', 'transitName'),
    numFactureTransit: getFirstString(backend, 'numFactureTransit', 'numFactTrans', 'numFactTransp', 'numFacture'),
    dateFactureTransit: getFirstString(backend, 'dateFactureTransit', 'dateFactTrans', 'dateTrans', 'dateFacture'),
    montantTransit: getFirstNumber(backend, 'montantTransit', 'montTrans', 'MontTrans'),
    droitDouane: parseNumber(backend.droitDouane),
    droitDTaxe: parseNumber(backend.droitDTaxe),
    montantTVADouane: parseNumber(backend.montantTVADouane),
    montantTSDouane: parseNumber(backend.montantTSDouane),
    fraisPhyto: parseNumber(backend.fraisPhyto),
    fraisDepotage: parseNumber(getFirst(backend, 'fraisDepotage', 'FraisDepotagTrans', 'fraisDepotage')),
    numCCTransit: getFirstString(backend, 'numCCTransit', 'numCCDoua', 'numCC'),
    numDosTran: getFirstString(backend, 'numDosTran', 'numDossierDoua', 'numDosTran'),
    numDeclarant: backend.numDeclarant || '',
    dateDeclarant: backend.dateDeclarant || '',
    montantTVAFactTrans: parseNumber(getFirst(backend, 'montantTVAFactTrans', 'montTVAIntervDouan', 'montantTVAFactTrans')),
    montantTVAInterv: parseNumber(getFirst(backend, 'montantTVAInterv', 'montantTVAInterv', 'montTVAIntervDouan')),
    aconnier: mapRestDetail(backend.aconnier),
    fret: mapRestDetail(backend.fret),
    // Certains backends retournent 'transp' au lieu de 'transport'
    transport: mapRestDetail((backend.transport as any) || (backend.transp as any) || undefined),
    change: mapRestDetail(backend.change),
    surestaire: mapRestDetail(backend.surestaire),
    magasinage: mapRestDetail(backend.magasinage),
    reglements: (backend.reglements || []).map((reg) => ({
      id: reg.id?.toString() || '',
      date: reg.date || '',
      reference: reg.reference || '',
      modePaiement: reg.modePaiement || '',
      banque: reg.banque || '',
      montantDevise: parseNumber(reg.montantDevise),
      devise: reg.devise || '',
      coursDevise: parseNumber(reg.coursDevise),
      montantCFA: parseNumber(reg.montantCFA),
      montantTPS: parseNumber(reg.montantTPS),
      fraisBancaires: parseNumber(reg.fraisBancaires),
    })),
    teus: (backend.teus || []).map((teu) => ({
      id: teu.id?.toString() || '',
      numero: teu.numero || '',
    })),
  };
};

/**
 * Convertit les données backend en format frontend
 */
export const mapBackendToFrontend = (backend: BackendDossier | RestBackendDossier): Dossier =>
  isLegacyBackendDossier(backend) ? mapLegacyBackendToFrontend(backend) : mapRestBackendToFrontend(backend as RestBackendDossier);

/**
 * Convertit les données frontend en format backend pour POST/PUT
 */
export const mapFrontendToBackend = (dossier: Partial<Dossier>): any => {
  const payload: any = {};
  const hasExistingId = Boolean(dossier.id);
  const dossierId = toNumericId(dossier.id);

  // Champs principaux
  if (dossier.numeroDossier !== undefined) payload.NumDossier = dossier.numeroDossier;
  if (dossier.origine !== undefined) {
    const oid = toNumericId(typeof dossier.origine === 'object' ? (dossier.origine as any).id : dossier.origine);
    if (oid !== undefined) payload.IdOrigine = oid;
    if (typeof dossier.origine === 'object') {
      payload.origine = { ...(dossier.origine as any), IdOrigine: oid };
    }
  }
  if (dossier.numFRI !== undefined) { payload.NumFRI = dossier.numFRI; payload.numFRI = dossier.numFRI; }
  if (dossier.numBSC !== undefined) { payload.NumBSC = dossier.numBSC; payload.numBSC = dossier.numBSC; }
  if (dossier.montantBSC !== undefined) payload.MontBSC = dossier.montantBSC;
  if (dossier.numBL !== undefined) { payload.NumBL = dossier.numBL; payload.numBL = dossier.numBL; }
  if (dossier.date !== undefined) payload.DateBL = dossier.date;
  if (dossier.armateur !== undefined) {
    const aid = toNumericId(dossier.armateur);
    if (aid !== undefined) payload.IdArmat = aid;
  }
  if (dossier.navire !== undefined) {
    const nid = toNumericId(dossier.navire);
    if (nid !== undefined) payload.IdNavire = nid;
  }
  if (dossier.dateETA !== undefined) payload.DatETA = dossier.dateETA;
  if (dossier.numFactureVendeur !== undefined) payload.NumFactVend = dossier.numFactureVendeur;
  if (dossier.dateFactureVendeur !== undefined) payload.DatFactVendeur = dossier.dateFactureVendeur;
  if (dossier.montantFacture !== undefined) payload.MontFactVend = dossier.montantFacture;
  if (dossier.devise !== undefined) payload.Devise = dossier.devise;
  if (dossier.cours !== undefined) payload.CoursDevise = dossier.cours;
  if (dossier.montantCFA !== undefined) payload.MontCFA = dossier.montantCFA;
  if (dossier.montantAssurance !== undefined) payload.MontAssur = dossier.montantAssurance;
  if (dossier.incoterm !== undefined) payload.Incoterm = dossier.incoterm;
  if (dossier.type !== undefined) {
    const tid = toNumericId(typeof dossier.type === 'object' ? (dossier.type as any).id : dossier.type);
    if (tid !== undefined) payload.IdTypeDos = tid;
    if (typeof dossier.type === 'object') {
      payload.type = { ...(dossier.type as any), IdType: tid };
    }
  }
  if (dossier.qte !== undefined) payload.Qte = dossier.qte;
  if (dossier.nbreTEU !== undefined) payload.NbreTEU = dossier.nbreTEU;
  if (dossier.vendeur !== undefined) payload.NomVendeur = dossier.vendeur;

  // Items (designations)
  if (dossier.items !== undefined) {
    payload.designations = dossier.items.map((item) => {
      const numericId = toExistingNumericId(item.id as any);
      const includeId = hasExistingId && numericId !== undefined;

      return {
        ...(includeId && { IdDesig: numericId }),
        LibelleDesig: item.designation,
        QteDesig: item.quantite,
        FOBDesig: item.fob,
        ...(dossierId !== undefined && { IdDossier: dossierId }),
      };
    });

    // Also set new API format, with legacy aliases included under items as required by some validators
    payload.items = dossier.items.map((item) => {
      const numericId = toExistingNumericId(item.id as any);
      const includeId = hasExistingId && numericId !== undefined;
      return {
        id: numericId,
        quantite: item.quantite,
        designation: item.designation,
        fob: item.fob,
        ...(includeId && { IdDesig: numericId }),
        LibelleDesig: item.designation,
        QteDesig: item.quantite,
        FOBDesig: item.fob,
        ...(dossierId !== undefined && { IdDossier: dossierId }),
      };
    });
  }

  // Prix reviens
  if (dossier.prixReviens !== undefined) {
    payload.prix_unitaires = dossier.prixReviens.map((pr) => {
      const numericId = toExistingNumericId(pr.id as any);
      const includeId = hasExistingId && numericId !== undefined;

      return {
        ...(includeId && { IdPU: numericId }),
        DesignPU: pr.designation,
        QtePU: pr.quantite,
        FOBDevisePU: pr.fob,
        CFA_Abidjan: pr.cfa,
        Pour100: pr.percentage,
        Revient: pr.prixRevient,
        ...(dossierId !== undefined && { IdDossier: dossierId }),
      };
    });

    // Also set new API format, with legacy aliases included under prixReviens
    payload.prixReviens = dossier.prixReviens.map((pr) => {
      const numericId = toExistingNumericId(pr.id as any);
      const includeId = hasExistingId && numericId !== undefined;
      return {
        id: numericId,
        designation: pr.designation,
        quantite: pr.quantite,
        fob: pr.fob,
        cfa: pr.cfa,
        percentage: pr.percentage,
        prixRevient: pr.prixRevient,
        ...(includeId && { IdPU: numericId }),
        DesignPU: pr.designation,
        QtePU: pr.quantite,
        FOBDevisePU: pr.fob,
        CFA_Abidjan: pr.cfa,
        Pour100: pr.percentage,
        Revient: pr.prixRevient,
        ...(dossierId !== undefined && { IdDossier: dossierId }),
      };
    });
  }

  // Douanes
  if (dossier.nomTransit !== undefined) payload.NomTrans = dossier.nomTransit;
  if (dossier.numFactureTransit !== undefined) payload.NumFactTrans = dossier.numFactureTransit;
  if (dossier.dateFactureTransit !== undefined) payload.DateTrans = dossier.dateFactureTransit;
  if (dossier.montantTransit !== undefined) payload.MontTrans = dossier.montantTransit;
  if (dossier.droitDouane !== undefined) payload.DroitDoua = dossier.droitDouane;
  if (dossier.droitDTaxe !== undefined) payload.DroitTaxDoua = dossier.droitDTaxe;
  if (dossier.montantTVADouane !== undefined) payload.MontTVADoua = dossier.montantTVADouane;
  if (dossier.montantTSDouane !== undefined) payload.MontSTDoua = dossier.montantTSDouane;
  if (dossier.fraisPhyto !== undefined) payload.FraisPhytoDoua = dossier.fraisPhyto;
  if (dossier.fraisDepotage !== undefined) payload.FraisDepotagTrans = dossier.fraisDepotage;
  if (dossier.numCCTransit !== undefined) payload.NumCCDoua = dossier.numCCTransit;
  if (dossier.numDosTran !== undefined) payload.NumDossierDoua = dossier.numDosTran;
  if (dossier.numDeclarant !== undefined) payload.NumDeclarTrans = dossier.numDeclarant;
  if (dossier.dateDeclarant !== undefined) payload.DateDeclarTrans = dossier.dateDeclarant;
  if (dossier.montantTVAFactTrans !== undefined) payload.MontTVAIntervDouan = dossier.montantTVAFactTrans;
  if (dossier.montantTVAInterv !== undefined) payload.MontIntervTrans = dossier.montantTVAInterv;

  // Détails administratifs
  if (dossier.aconnier !== undefined) {
    payload.NomAccon = dossier.aconnier.nom;
    payload.NumFactAccon = dossier.aconnier.numFacture;
    payload.DateAccon = dossier.aconnier.date;
    payload.NumCCAccon = dossier.aconnier.numCC;
    payload.MontAccon = dossier.aconnier.montant;
    payload.MontTaxabAccon = dossier.aconnier.montantTaxable;
    payload.MontTVAAccon = dossier.aconnier.montantTVA;
  }
  if (dossier.fret !== undefined) {
    payload.NomFret = dossier.fret.nom;
    payload.NumFactFret = dossier.fret.numFacture;
    payload.DateFret = dossier.fret.date;
    payload.NumCCFret = dossier.fret.numCC;
    payload.MontFret = dossier.fret.montant;
    payload.MontTaxabFret = dossier.fret.montantTaxable;
    payload.MontTVAFret = dossier.fret.montantTVA;
  }
  if (dossier.transport !== undefined) {
    payload.NomTransp = dossier.transport.nom;
    payload.NumFactTransp = dossier.transport.numFacture;
    payload.DateTransp = dossier.transport.date;
    payload.numCCTransp = dossier.transport.numCC;
    payload.NumCCTransp = dossier.transport.numCC;
    payload.MontTransp = dossier.transport.montant;
    payload.MontTaxabTransp = dossier.transport.montantTaxable;
    payload.MontTVATransp = dossier.transport.montantTVA;
  }
  if (dossier.change !== undefined) {
    payload.NomChang = dossier.change.nom;
    payload.NumFactChang = dossier.change.numFacture;
    payload.DateChang = dossier.change.date;
    payload.numCCChang = dossier.change.numCC;
    payload.NumCCChang = dossier.change.numCC;
    payload.MontChang = dossier.change.montant;
    payload.MontTaxabChang = dossier.change.montantTaxable;
    payload.MontTVAChang = dossier.change.montantTVA;
  }
  if (dossier.surestaire !== undefined) {
    payload.NomSurrest = dossier.surestaire.nom;
    payload.numFactureSurrest = dossier.surestaire.numFacture;
    payload.DateSurrest = dossier.surestaire.date;
    payload.numCCSurrest = dossier.surestaire.numCC;
    payload.MontSurrest = dossier.surestaire.montant;
    payload.MonttaxabSurrest = dossier.surestaire.montantTaxable;
    payload.MontTVASurrest = dossier.surestaire.montantTVA;
  }
  if (dossier.magasinage !== undefined) {
    payload.NomMag = dossier.magasinage.nom;
    payload.NumFactMag = dossier.magasinage.numFacture;
    payload.DateMag = dossier.magasinage.date;
    payload.numCCMag = dossier.magasinage.numCC;
    payload.MontMag = dossier.magasinage.montant;
    payload.MontTaxabMag = dossier.magasinage.montantTaxable;
    payload.MontTVAMag = dossier.magasinage.montantTVA;
  }

  // Règlements
  if (dossier.reglements !== undefined) {
    payload.reglements = dossier.reglements.map((reg) => {
      const numericId = toExistingNumericId(reg.id as any);
      const includeId = hasExistingId && numericId !== undefined;

      return {
        ...(includeId && { IdReglt: numericId }),
        DateReglt: reg.date,
        RefReglt: reg.reference,
        ModeReglt: reg.modePaiement,
        BanqReglt: reg.banque,
        MontReglt: reg.montantDevise,
        DeviseReglt: reg.devise,
        CoursDevisReglt: reg.coursDevise,
        MontCFAReglt: reg.montantCFA,
        MontTpsReglt: reg.montantTPS,
        FraisBanqReglt: reg.fraisBancaires,
        ...(dossierId !== undefined && { IdDossier: dossierId }),
      };
    });
  }

  // TEUs
  if (dossier.teus !== undefined) {
    payload.conteneurs = dossier.teus.map((teu) => {
      const numericId = toExistingNumericId(teu.id as any);
      const includeId = hasExistingId && numericId !== undefined;

      return {
        ...(includeId && { IdConteiner: numericId }),
        NumConteiner: teu.numero,
        ...(dossierId !== undefined && { IdDossier: dossierId }),
      };
    });

    // Also set new API format, with legacy alias inside teus
    payload.teus = dossier.teus.map((teu) => {
      const numericId = toExistingNumericId(teu.id as any);
      const includeId = hasExistingId && numericId !== undefined;
      return {
        id: numericId,
        numero: teu.numero,
        ...(includeId && { IdConteiner: numericId }),
        NumConteiner: teu.numero,
        ...(dossierId !== undefined && { IdDossier: dossierId }),
      };
    });
  }

  return payload;
};

/**
 * Récupère la liste paginée des dossiers
 */
export const getDossiers = async (params?: {
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Dossier>> => {
  try {
    const response = await axios.get<PaginatedResponse<BackendDossier>>(API_BASE_URL, {
      params,
      headers: getAuthHeader(),
    });

    if (!response.data.success || !Array.isArray(response.data.data)) {
      throw new Error('Format de réponse inattendu de l\'API');
    }

    const dossiers = response.data.data.map(mapBackendToFrontend);

    return {
      success: response.data.success,
      data: dossiers,
      pagination: response.data.pagination,
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des dossiers:', error);
    let errorMessage = 'Erreur lors de la récupération des dossiers';

    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion internet.';
    }

    throw new Error(errorMessage);
  }
};

/**
 * Récupère un dossier par son ID
 */
export const getDossierById = async (id: string | number): Promise<Dossier> => {
  try {
    const response = await axios.get<ApiResponse<BackendDossier>>(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Dossier non trouvé');
    }

    return mapBackendToFrontend(response.data.data);
  } catch (error: any) {
    console.error(`Erreur lors de la récupération du dossier ${id}:`, error);
    let errorMessage = 'Erreur lors de la récupération du dossier';

    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Dossier non trouvé';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    }

    throw new Error(errorMessage);
  }
};

/**
 * Crée un nouveau dossier
 */
export const createDossier = async (dossier: Omit<Dossier, 'id'>): Promise<Dossier> => {
  try {
    const payload = mapFrontendToBackend(dossier);
    // Log payload for debugging server 500 issues
    console.debug('[dossierService] createDossier payload:', payload);

    const response = await axios.post<ApiResponse<BackendDossier>>(API_BASE_URL, payload, {
      headers: getAuthHeader(),
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Erreur lors de la création du dossier');
    }

    return mapBackendToFrontend(response.data.data);
  } catch (error: any) {
    console.error('Erreur lors de la création du dossier:', error);
    let errorMessage = 'Erreur lors de la création du dossier';

    if (error.response) {
      // Prefer backend message when present
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Append validation errors if present
      if (error.response.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = `${errorMessage}: ${errors.join(', ')}`;
      }

      // Include raw response body for debugging
      try {
        const raw = JSON.stringify(error.response.data);
        errorMessage = `${errorMessage} -- server response: ${raw}`;
      } catch (e) {
        // ignore stringify errors
      }
    }

    throw new Error(errorMessage);
  }
};

/**
 * Met à jour un dossier existant
 */
export const updateDossier = async (id: string | number, dossier: Partial<Omit<Dossier, 'id'>>): Promise<Dossier> => {
  try {
    const payload = mapFrontendToBackend({ ...dossier, id: String(id) });

    const response = await axios.put<ApiResponse<BackendDossier>>(`${API_BASE_URL}/${id}`, payload, {
      headers: getAuthHeader(),
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour du dossier');
    }

    return mapBackendToFrontend(response.data.data);
  } catch (error: any) {
    console.error(`Erreur lors de la mise à jour du dossier ${id}:`, error);
    let errorMessage = 'Erreur lors de la mise à jour du dossier';

    if (error.response) {
      // show status code for easier debugging
      const status = error.response.status;

      // Prefer backend message, but append field-level errors when present
      const backendMessage = error.response.data?.message;
      const backendErrors = error.response.data?.errors;

      if (backendMessage && backendErrors) {
        const flat = Object.values(backendErrors).flat();
        errorMessage = `${backendMessage} (${status}): ${flat.join(', ')}`;
      } else if (backendErrors) {
        const flat = Object.values(backendErrors).flat();
        errorMessage = `Erreur de validation (${status}): ${flat.join(', ')}`;
      } else if (backendMessage) {
        errorMessage = `${backendMessage} (${status})`;
      } else {
        errorMessage = `Erreur HTTP ${status}`;
      }

      // Dump full response body to console to help debugging in dev
      console.debug('Détails de la réponse du serveur:', error.response.data);
    }

    throw new Error(errorMessage);
  }
};

/**
 * Supprime un dossier
 */
export const deleteDossier = async (id: string | number): Promise<void> => {
  try {
    await axios.delete<ApiResponse<void>>(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
  } catch (error: any) {
    console.error(`Erreur lors de la suppression du dossier ${id}:`, error);
    let errorMessage = 'Erreur lors de la suppression du dossier';

    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Dossier non trouvé';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    }

    throw new Error(errorMessage);
  }
};

export default {
  getDossiers,
  getDossierById,
  createDossier,
  updateDossier,
  deleteDossier,
};

