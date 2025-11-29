# Structure Complète de l'Objet Dossier

Ce document décrit la structure complète de l'objet `Dossier` utilisé pour l'enregistrement des dossiers dans l'application SMART Fret.

## Vue d'ensemble

L'objet `Dossier` est composé de **6 sections principales** :

1. **Dossier Livraison** - Informations générales du dossier
2. **Calcul Prix Unitaire** - Calculs des prix de revient
3. **Douanes** - Informations douanières
4. **Détails Administratifs** - 6 sous-sections administratives
5. **Règlements** - Liste des paiements
6. **T.E.U** - Liste des conteneurs

---

## 1. Section : Dossier Livraison

### Champs principaux

```typescript
{
  numeroDossier: string;      // Numéro unique du dossier (requis)
  origine: string;             // Pays d'origine (ex: "Chine", "France")
  numFRI: string;             // Numéro FRI
  numBSC: string;             // Numéro BSC
  montantBSC: number;         // Montant BSC en devise
  numBL: string;             // Numéro de connaissement (Bill of Lading)
  type: string;              // Type de dossier (ex: "D3")
  qte: number;               // Quantité totale
  nbreTEU: number;           // Nombre de conteneurs (TEU)
  vendeur: string;           // Nom du vendeur/fournisseur
}
```

### Items (Liste des produits)

```typescript
items: Array<{
  id: string;                // ID temporaire (peut être supprimé avant envoi API)
  quantite: number;          // Quantité de l'item
  designation: string;      // Description du produit
  fob: number;              // Prix FOB (Free On Board)
}>
```

**Exemple :**
```json
{
  "items": [
    {
      "id": "item_1",
      "quantite": 50,
      "designation": "Électroniques - Smartphones",
      "fob": 25000.00
    }
  ]
}
```

---

## 2. Section : Calcul Prix Unitaire

```typescript
prixReviens: Array<{
  id: string;                // ID temporaire
  designation: string;      // Désignation du produit
  quantite: number;         // Quantité
  fob: number;             // Prix FOB
  cfa: number;             // Montant en CFA
  percentage: number;       // Pourcentage appliqué
  prixRevient: number;      // Prix de revient calculé
}>
```

**Exemple :**
```json
{
  "prixReviens": [
    {
      "id": "prix_1",
      "designation": "Électroniques - Smartphones",
      "quantite": 50,
      "fob": 25000.00,
      "cfa": 15000000.00,
      "percentage": 10.5,
      "prixRevient": 16575000.00
    }
  ]
}
```

---

## 3. Section : Douanes

```typescript
{
  nomTransit: string;              // Nom de la société de transit
  numFactureTransit: string;      // Numéro de facture transit
  dateFactureTransit: string;     // Date facture (format: "YYYY-MM-DD")
  montantTransit: number;         // Montant du transit
  droitDouane: number;            // Droits de douane
  droitDTaxe: number;            // Droit D. taxe
  montantTVADouane: number;       // Montant TVA douane
  montantTSDouane: number;        // Montant TS douane
  fraisPhyto: number;             // Frais phytosanitaires
  fraisDepotage: number;          // Frais de dépotage
  numCCTransit: string;           // Numéro CC Transit
  numDosTran: string;             // Numéro Dossier Transit
  numDeclarant: string;           // Numéro déclarant
  dateDeclarant: string;          // Date déclarant (format: "YYYY-MM-DD")
  montantTVAFactTrans: number;    // Montant TVA Facture Transit
  montantTVAInterv: number;       // Montant TVA Intervention
}
```

---

## 4. Section : Détails Administratifs

Cette section contient **6 sous-sections** identiques :

- `aconnier` - Informations sur l'aconnier
- `fret` - Informations sur le fret
- `transport` - Informations sur le transport
- `change` - Informations sur le change
- `surestaire` - Informations sur le surestaire
- `magasinage` - Informations sur le magasinage

### Structure de chaque sous-section

```typescript
{
  nom: string;              // Nom de l'entreprise/prestataire
  numFacture: string;       // Numéro de facture
  date: string;            // Date (format: "YYYY-MM-DD")
  numCC: string;           // Numéro C.C
  montant: number;         // Montant total
  montantTaxable: number;  // Montant taxable
  montantTVA: number;     // Montant TVA
}
```

**Exemple complet :**
```json
{
  "aconnier": {
    "nom": "Port Autonome de Dakar",
    "numFacture": "AC-2024-001",
    "date": "2024-01-10",
    "numCC": "CC-AC-001",
    "montant": 800.00,
    "montantTaxable": 750.00,
    "montantTVA": 150.00
  },
  "fret": { /* même structure */ },
  "transport": { /* même structure */ },
  "change": { /* même structure */ },
  "surestaire": { /* même structure */ },
  "magasinage": { /* même structure */ }
}
```

---

## 5. Section : Règlements

Liste des paiements effectués pour le dossier.

```typescript
reglements: Array<{
  id: string;                  // ID temporaire
  date: string;               // Date du règlement (format: "YYYY-MM-DD")
  reference: string;          // Référence du paiement
  modePaiement: string;       // "Virement" ou "Chèque"
  banque: string;             // Nom de la banque
  montantDevise: number;      // Montant en devise étrangère
  devise: string;             // Code devise ("USD", "EUR", etc.)
  coursDevise: number;        // Taux de change
  montantCFA: number;         // Montant converti en CFA
  montantTPS: number;         // Montant TPS
  fraisBancaires: number;     // Frais bancaires
}>
```

**Exemple :**
```json
{
  "reglements": [
    {
      "id": "reg_1",
      "date": "2024-01-10",
      "reference": "PAY-2024-001",
      "modePaiement": "Virement",
      "banque": "CBAO",
      "montantDevise": 50000.00,
      "devise": "USD",
      "coursDevise": 600.00,
      "montantCFA": 30000000.00,
      "montantTPS": 0.00,
      "fraisBancaires": 50.00
    }
  ]
}
```

---

## 6. Section : T.E.U (Conteneurs)

Liste des numéros de conteneurs (TEU = Twenty-foot Equivalent Unit).

```typescript
teus: Array<{
  id: string;        // ID temporaire
  numero: string;    // Numéro du conteneur (ex: "MSCU1234567")
}>
```

**Exemple :**
```json
{
  "teus": [
    {
      "id": "teu_1",
      "numero": "MSCU1234567"
    },
    {
      "id": "teu_2",
      "numero": "CMAU7654321"
    }
  ]
}
```

---

## Objet Complet - Exemple

Voir les fichiers :
- `exemple-objet-dossier.json` - Format JSON
- `exemple-dossier-complet.ts` - Format TypeScript avec types

---

## Notes Importantes

### 1. ID temporaires
Les `id` dans les tableaux (`items`, `prixReviens`, `reglements`, `teus`) sont des identifiants temporaires utilisés par React Hook Form. Ils peuvent être supprimés avant l'envoi à l'API si le backend génère ses propres IDs.

### 2. Format des dates
Toutes les dates doivent être au format **ISO 8601** : `"YYYY-MM-DD"` (ex: `"2024-01-15"`)

### 3. Champs numériques
Tous les montants et quantités sont des nombres (`number`), pas des chaînes de caractères.

### 4. Champs optionnels
La plupart des champs peuvent être vides (`""`) ou à zéro (`0`) selon le contexte. Seul `numeroDossier` est généralement requis.

### 5. Préparation pour l'API
Avant d'envoyer à l'API, vous pouvez supprimer les IDs temporaires :

```typescript
const dossierPourAPI = {
  ...dossier,
  items: dossier.items.map(({ id, ...item }) => item),
  prixReviens: dossier.prixReviens.map(({ id, ...item }) => item),
  reglements: dossier.reglements.map(({ id, ...item }) => item),
  teus: dossier.teus.map(({ id, ...item }) => item)
};
```

---

## Utilisation dans le Code

### Créer un nouveau dossier

```typescript
import { exempleDossierComplet } from './exemple-dossier-complet';

// Utiliser l'exemple comme base
const nouveauDossier = {
  ...exempleDossierComplet,
  numeroDossier: "DOS-2024-002", // Modifier le numéro
  // ... autres modifications
};

// Envoyer à l'API
await creerDossierAPI(nouveauDossier);
```

### Créer un dossier vide

```typescript
import { dossierVide } from './exemple-dossier-complet';

const nouveauDossierVide = dossierVide;
// Remplir les champs nécessaires
nouveauDossierVide.numeroDossier = "DOS-2024-003";
// ...
```

---

## Validation

Avant l'envoi, vérifiez :
- ✅ `numeroDossier` n'est pas vide
- ✅ Les dates sont au bon format
- ✅ Les montants sont des nombres valides
- ✅ Les tableaux ne sont pas `null` (utiliser `[]` si vide)
- ✅ Les objets `DetailAdministratif` ont tous les champs requis

