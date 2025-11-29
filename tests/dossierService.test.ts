import { describe, it, expect } from 'vitest';
import { mapFrontendToBackend, mapRestBackendToFrontend, mapBackendToFrontend } from '../services/dossierService';

describe('dossierService mappings', () => {
  it('mapFrontendToBackend accepts origine/type as objects', () => {
    const payload: any = mapFrontendToBackend({
      origine: { id: 2, label: 'Japon', nom: 'Japon' },
      type: { id: 7, libelle: 'D3', label: 'D3' },
    });

    expect(payload.origine).toBeDefined();
    expect(payload.origine.id).toBe(2);
    expect(payload.origine.label).toBe('Japon');
    expect(payload.origine.nom).toBe('Japon');

    expect(payload.type).toBeDefined();
    expect(payload.type.id).toBe(7);
    expect(payload.type.libelle).toBe('D3');
    // legacy compat fields
    expect(payload.IdOrigine).toBe(2);
    expect(payload.IdTypeDos).toBe(7);
  });

  it('includes nested ids when updating (dossier.id present)', () => {
    const payload: any = mapFrontendToBackend({
      id: '9',
      items: [{ id: '33', quantite: 600, designation: 'X', fob: 320 }],
      prixReviens: [{ id: '36', designation: 'Y', quantite: 600, fob: 500, cfa: 305000, percentage: 12.5, prixRevient: 355000 }],
      teus: [{ id: '40', numero: 'MSKU5566771' }],
    });

    expect(payload.items[0].id).toBe(33);
    expect(payload.items[0].IdDesig).toBe(33);
    expect(payload.items[0].LibelleDesig).toBe('X');
    expect(payload.items[0].QteDesig).toBe(600);
    expect(payload.items[0].FOBDesig).toBe(320);
    expect(payload.prixReviens[0].id).toBe(36);
    expect(payload.prixReviens[0].IdPU).toBe(36);
    expect(payload.prixReviens[0].DesignPU).toBe('Y');
    expect(payload.prixReviens[0].QtePU).toBe(600);
    expect(payload.prixReviens[0].FOBDevisePU).toBe(500);
    expect(payload.teus[0].id).toBe(40);
    expect(payload.teus[0].IdConteiner).toBe(40);
    expect(payload.teus[0].NumConteiner).toBe('MSKU5566771');
  });

  it('includes origin/type fields and legacy Ids for update', () => {
    const payload: any = mapFrontendToBackend({
      id: '8',
      origine: { id: 2, nom: 'Chine', label: 'Chine' },
      type: { id: 7, libelle: 'D3', label: 'D3' },
      numFRI: 'FRI-XYZ',
      numBSC: 'BSC-XYZ',
      numBL: 'BL-XYZ',
    });

    expect(payload.IdOrigine).toBe(2);
    expect(payload.origine.IdOrigine).toBe(2);
    expect(payload.origine.label).toBe('Chine');
    expect(payload.IdTypeDos).toBe(7);
    expect(payload.type.id).toBe(7);
    expect(payload.type.libelle).toBe('D3');
    expect(payload.NumFRI).toBe('FRI-XYZ');
    expect(payload.numFRI).toBe('FRI-XYZ');
    expect(payload.NumBSC).toBe('BSC-XYZ');
    expect(payload.numBSC).toBe('BSC-XYZ');
    expect(payload.NumBL).toBe('BL-XYZ');
    expect(payload.numBL).toBe('BL-XYZ');
  });

  it('mapRestBackendToFrontend normalizes aliases (transp, numFactTrans, etc.)', () => {
    const backend: any = {
      transp: { nom: 'Trans Cité', numFacture: 'TP-552', date: '2025-11-02', montant: 95000, montantTaxable: 80000, montantTVA: 15000 },
      nomTransit: 'Transit Afrique',
      numFactTrans: 'TR-4512',
      dateTrans: '2025-11-03',
      montantTransit: '220000',
      numCCDoua: 'CC-TR-88',
      numDossierDoua: 'DTX-5522',
      montantTVAFactTrans: '54000',
    };

    const dossier = mapBackendToFrontend(backend as any);

    expect(dossier.transport.nom).toBe('Trans Cité');
    expect(dossier.nomTransit).toBe('Transit Afrique');
    expect(dossier.numFactureTransit).toBe('TR-4512');
    expect(dossier.dateFactureTransit).toBe('2025-11-03');
    expect(dossier.montantTransit).toBe(220000);
    expect(dossier.numCCTransit).toBe('CC-TR-88');
    expect(dossier.numDosTran).toBe('DTX-5522');
    expect(dossier.montantTVAFactTrans).toBe(54000);
  });

  it('mapLegacyBackendToFrontend handles provided backend response structure', () => {
    const backend: any = {
      IdDossier: 3878,
      NumDossier: 'DOS-TEST-003',
      IdOrigine: 390,
      numFRI: 'FRI-001',
      numBSC: 'BSC-001',
      MontBSC: 2500,
      numBL: 'BL-2025-44',
      DateBL: '2025-12-10',
      IdArmat: 5,
      IdNavire: 12,
      DatETA: '2025-12-22',
      NumFactVend: 'INV-908',
      DatFactVendeur: '2025-12-09',
      MontFactVend: 3800,
      Devise: 'EUR',
      CoursDevise: 655,
      MontCFA: 2489000,
      MontAssur: '75',
      Incoterm: 'FOB',
      IdTypeDos: 9,
      Qte: 22,
      NbreTEU: 2,
      NomVendeur: 'Global Supplier SARL',
      items: [
        { IdDesig: 1914, QteDesig: 0, LibelleDesig: 'Ordinateur portable HP EliteBook', FOBDesig: '255525', IdDossier: 3878 }
      ],
      prixReviens: [
        { IdPU: 850, DesignPU: '', QtePU: 0, FOBDevisePU: '0.00', CFA_Abidjan: '0.00000', Pour100: '0.00', Revient: '0.000', IdDossier: 3878 }
      ],
      NomTrans: 'Transit CI',
      NumFactTrans: 'T-2025-544',
      DateTrans: '2025-12-11',
      MontTrans: 190000,
      DroitDoua: 150000,
      DroitTaxDoua: 35000,
      MontTVADoua: 90000,
      MontSTDoua: 15000,
      FraisPhytoDoua: 5000,
      FraisDepotagTrans: '12000',
      NumCCDoua: 'CC-DUA-9981',
      NumDossierDoua: 'DUA-55487',
      NumDeclarTrans: 'DEC-2025-778',
      DateDeclarTrans: '2025-12-12',
      MontIntervTrans: 10000,
      NomAccon: 'Acconier Afrique',
      NumFactAccon: 'AC-2025-118',
      DateAccon: '2025-12-13',
      NumCCAccon: 'CC-AC-4521',
      MontAccon: 110000,
      MontTaxabAccon: 95000,
      MontTVAAccon: 15000,
      NomFret: 'Fret Maritime Global',
      NumFactFret: 'FM-2025-339',
      DateFret: '2025-12-09',
      NumCCFret: 'CC-FM-3399',
      MontFret: 560000,
      MontTaxabFret: 480000,
      MontTVAFret: 80000,
      NomTransp: 'Transport CI Express',
      NumFactTransp: 'TRP-2025-221',
      DateTransp: '2025-12-14',
      numCCTransp: 'CC-TRP-8899',
      MontTransp: 90000,
      MontTaxabTransp: 80000,
      MontTVATransp: 10000,
      NomChang: 'Change Bureau X',
      NumFactChang: 'CH-2025-712',
      DateChang: '2025-12-09',
      numCCChang: 'CC-CH-4477',
      MontChang: 10500,
      MontTaxabChang: 9500,
      MontTVAChang: 1000,
      NomSurrest: 'Surrest Maritime CI',
      numFactureSurrest: 'SR-2025-101',
      DateSurrest: '2025-12-16',
      numCCSurrest: 'CC-SR-1166',
      MontSurrest: 70000,
      MonttaxabSurrest: 65000,
      MontTVASurrest: 5000,
      NomMag: 'Magasinage Portuaire',
      NumFactMag: 'MG-2025-550',
      DateMag: '2025-12-17',
      numCCMag: 'CC-MG-7788',
      MontMag: 45000,
      MontTaxabMag: 40000,
      MontTVAMag: 5000,
      reglements: [
        { IdReglt: 8051, DateReglt: '2025-12-10', RefReglt: 'REG-9002', ModeReglt: 'Chèque', BanqReglt: 'Bank B', MontReglt: '2000.000', DeviseReglt: 'EUR', CoursDevisReglt: '655.000', MontCFAReglt: '1310000.00000', MontTpsReglt: 225, FraisBanqReglt: 15, IdDossier: 3878 }
      ],
      teus: [
        { IdConteiner: 10975, NumConteiner: 'MSKU5566771', IdDossier: 3878 }
      ]
    };

    const dossier = mapBackendToFrontend(backend as any);

    expect(dossier.numeroDossier).toBe('DOS-TEST-003');
    expect(dossier.numFRI).toBe('FRI-001');
    expect(dossier.numBSC).toBe('BSC-001');
    expect(dossier.numBL).toBe('BL-2025-44');
    expect(dossier.armateur).toBe('5');
    expect(dossier.navire).toBe('12');
    expect(dossier.items[0].designation).toContain('EliteBook');
    expect(dossier.prixReviens[0].quantite).toBe(0);
    expect(dossier.change.numCC).toBe('CC-CH-4477');
    expect(dossier.transport.numCC).toBe('CC-TRP-8899');
    expect(dossier.surestaire.numCC).toBe('CC-SR-1166');
    expect(dossier.magasinage.numCC).toBe('CC-MG-7788');
    expect(dossier.reglements.length).toBe(1);
    expect(dossier.teus[0].numero).toBe('MSKU5566771');
  });
});
