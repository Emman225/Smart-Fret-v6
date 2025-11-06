import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler, useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import { Dossier, DetailAdministratif } from '../../types';
import { useDossiers } from '../../context/AppContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DeleteIcon, PlusCircleIcon } from '../../components/icons';

const MySwal = withReactContent(Swal);

const countries = [ "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda", "Arabie saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge", "Cameroun", "Canada", "Cap-Vert", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique", "Égypte", "Émirats arabes unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini", "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Guyana", "Haïti", "Honduras", "Hongrie", "Îles Cook", "Îles Marshall", "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigeria", "Niue", "Norvège", "Nouvelle-Zélande", "Oman", "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal", "Qatar", "République centrafricaine", "République démocratique du Congo", "République du Congo", "République dominicaine", "République tchèque", "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Saint-Christophe-et-Niévès", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie", "Salomon", "Salvador", "Samoa", "Sao Tomé-et-Principe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Viêt Nam", "Yémen", "Zambie", "Zimbabwe" ];


// --- FORM DATA DEFAULTS ---
const emptyDetailAdministratif: DetailAdministratif = {
    nom: '', numFacture: '', date: '', numCC: '', montant: 0, montantTaxable: 0, montantTVA: 0,
};
const defaultValues: Dossier = {
    id: '', numeroDossier: '', origine: 'Chine', numFRI: '', numBSC: '', montantBSC: 0, numBL: '', type: 'D3', qte: 0, nbreTEU: 0, vendeur: '',
    items: [{ id: '1', quantite: 0, designation: '', fob: 0 }],
    prixReviens: [{ id: '1', designation: '', quantite: 0, fob: 0, cfa: 0, percentage: 0, prixRevient: 0 }],
    nomTransit: '', numFactureTransit: '', dateFactureTransit: '', montantTransit: 0, droitDouane: 0, droitDTaxe: 0, montantTVADouane: 0, montantTSDouane: 0, fraisPhyto: 0, fraisDepotage: 0, numCCTransit: '', numDosTran: '', numDeclarant: '', dateDeclarant: '', montantTVAFactTrans: 0, montantTVAInterv: 0,
    aconnier: { ...emptyDetailAdministratif }, fret: { ...emptyDetailAdministratif }, transport: { ...emptyDetailAdministratif }, change: { ...emptyDetailAdministratif }, surestaire: { ...emptyDetailAdministratif }, magasinage: { ...emptyDetailAdministratif },
    reglements: [], teus: [{ id: '1', numero: '' }],
};

// --- STYLED & REUSABLE FORM COMPONENTS ---

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input 
        ref={ref}
        {...props} 
        className={`w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition ${props.className}`} 
    />
));

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode; }> (({ children, ...props }, ref) => (
    <select 
        ref={ref}
        {...props} 
        className={`w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition ${props.className}`}
    >
        {children}
    </select>
));

const FormSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
        <h2 className="bg-primary text-white text-sm font-semibold p-2 rounded-t-lg">{title}</h2>
        <div className="p-2 space-y-3">{children}</div>
    </div>
);

const CompactFieldWrapper: React.FC<{ label: string; children: React.ReactNode; error?: string, className?: string }> = ({ label, children, error, className = '' }) => (
    <div className={className}>
        <div className="grid grid-cols-3 items-center gap-2">
            <label className="col-span-1 text-xs font-medium text-slate-600 text-right pr-2">{label}</label>
            <div className="col-span-2">
                {children}
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
        </div>
    </div>
);

const DynamicTable: React.FC<{ title: string; children: React.ReactNode; onAdd: () => void; addLabel: string; }> = ({ title, children, onAdd, addLabel }) => (
    <div>
        {title && <h3 className="text-lg font-medium text-slate-700 mb-3">{title}</h3>}
        <div className="overflow-auto max-h-28 rounded-md border">{children}</div>
        <button type="button" onClick={onAdd} className="mt-3 flex items-center text-sm font-medium text-primary hover:text-blue-700 transition-colors">
            <PlusCircleIcon className="mr-2" /> {addLabel}
        </button>
    </div>
);

// --- MAIN FORM PAGE COMPONENT ---
const DossierFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getDossierById, addDossier, updateDossier } = useDossiers();
    const isEditing = Boolean(id);

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm<Dossier>({ defaultValues });
    
    const { fields: itemsFields, append: appendItem, remove: removeItem } = useFieldArray({ control, name: "items" });
    const { fields: prixReviensFields, append: appendPrixRevien, remove: removePrixRevien } = useFieldArray({ control, name: "prixReviens" });
    const { fields: reglementsFields, append: appendReglement, remove: removeReglement } = useFieldArray({ control, name: "reglements" });
    const { fields: teusFields, append: appendTeu, remove: removeTeu } = useFieldArray({ control, name: "teus" });

    useEffect(() => {
        const dossierToLoad = isEditing && id ? getDossierById(id) : defaultValues;
        if (dossierToLoad) {
             const sanitizedDossier = {
                ...defaultValues,
                ...dossierToLoad,
                items: dossierToLoad.items?.length ? dossierToLoad.items : defaultValues.items,
                prixReviens: dossierToLoad.prixReviens?.length ? dossierToLoad.prixReviens : defaultValues.prixReviens,
                reglements: dossierToLoad.reglements || [],
                teus: dossierToLoad.teus?.length ? dossierToLoad.teus : defaultValues.teus,
            };
            reset(sanitizedDossier);
        }
    }, [id, isEditing, getDossierById, reset]);
    
    const onSubmit: SubmitHandler<Dossier> = (data) => {
        if (isEditing && id) updateDossier({ ...data, id });
        else addDossier(data);
        
        MySwal.fire({
            title: 'Succès !',
            text: `Le dossier a été ${isEditing ? 'mis à jour' : 'créé'} avec succès.`,
            icon: 'success',
            background: '#334155',
            color: '#f8fafc'
        });
        navigate('/dossiers');
    };

    const DetailAdminSubSection: React.FC<{ register: UseFormRegister<Dossier>, fieldName: keyof Pick<Dossier, 'aconnier' | 'fret' | 'transport' | 'change' | 'surestaire' | 'magasinage'>, title: string }> = ({ register, fieldName, title }) => {
        const CompactField: React.FC<{ label: string; name: string; type?: string; }> = ({ label, name, type = "text" }) => {
            const props = type === 'number' ? { valueAsNumber: true } : {};
            return (
                <div className="grid grid-cols-3 items-center gap-2">
                    <label className="col-span-1 text-xs font-medium text-slate-500 text-right">{label}</label>
                    <div className="col-span-2">
                        <Input 
                            type={type}
                            className="py-1 px-2 text-xs" 
                            {...register(name as any, props)} 
                        />
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-700 mb-2 border-b border-slate-200 pb-1">{title}</h3>
                <CompactField label="Nom" name={`${fieldName}.nom`} />
                <CompactField label="N° Facture" name={`${fieldName}.numFacture`} />
                <CompactField label="Date" name={`${fieldName}.date`} type="date" />
                <CompactField label="N° C.C" name={`${fieldName}.numCC`} />
                <CompactField label="Montant" name={`${fieldName}.montant`} type="number" />
                <CompactField label="Mt taxable" name={`${fieldName}.montantTaxable`} type="number" />
                <CompactField label="Mt T.V.A" name={`${fieldName}.montantTVA`} type="number" />
            </div>
        );
    };
    
    const compactInputProps = { className: "py-1 px-2 text-xs" };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
             <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                {/* --- LEFT & MIDDLE COLUMNS --- */}
                <div className="xl:col-span-2 space-y-2">
                    <FormSection title="Dossier Livraison">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                            <CompactFieldWrapper label="N° Dossier"><Input {...register('numeroDossier', { required: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Origine">
                                <Select {...register('origine')} {...compactInputProps}>
                                    {countries.map(country => <option key={country} value={country}>{country}</option>)}
                                </Select>
                            </CompactFieldWrapper>
                            <CompactFieldWrapper label="N° FRI"><Input {...register('numFRI')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="N° BSC"><Input {...register('numBSC')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Montant BSC"><Input type="number" {...register('montantBSC', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="N° BL"><Input {...register('numBL')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Type">
                                <Select {...register('type')} {...compactInputProps}>
                                    <option>D3</option>
                                </Select>
                            </CompactFieldWrapper>
                            <CompactFieldWrapper label="Quantité"><Input type="number" {...register('qte', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Nombre T.E.U"><Input type="number" {...register('nbreTEU', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Vendeur" className="md:col-span-2 lg:col-span-3"><Input {...register('vendeur')} {...compactInputProps} /></CompactFieldWrapper>
                        </div>
                         <DynamicTable title="Items" onAdd={() => appendItem({ id: `${Date.now()}`, quantite: 0, designation: '', fob: 0 })} addLabel="Ajouter un item">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-sidebar-bg text-white"><tr className="text-left text-xs font-medium uppercase">
                                    <th className="p-1">Quantité</th><th className="p-1">Désignation</th><th className="p-1">FOB</th><th className="w-12"></th>
                                </tr></thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {itemsFields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="p-1 w-32"><Input type="number" {...register(`items.${index}.quantite`, { valueAsNumber: true })} {...compactInputProps}/></td>
                                            <td className="p-1"><Input {...register(`items.${index}.designation`)} {...compactInputProps}/></td>
                                            <td className="p-1 w-40"><Input type="number" {...register(`items.${index}.fob`, { valueAsNumber: true })} {...compactInputProps}/></td>
                                            <td className="p-1 text-center"><button type="button" onClick={() => removeItem(index)} className="text-red-500 p-1 rounded-full hover:bg-red-100"><DeleteIcon className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DynamicTable>
                    </FormSection>

                    <FormSection title="Calcul Prix Unitaire">
                         <DynamicTable title="" onAdd={() => appendPrixRevien({ id: `${Date.now()}`, designation: '', quantite: 0, fob: 0, cfa: 0, percentage: 0, prixRevient: 0 })} addLabel="Ajouter une ligne de calcul">
                             <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-sidebar-bg text-white"><tr className="text-left text-xs font-medium uppercase">
                                    <th className="p-1">Désignation</th><th className="p-1">Qté</th><th className="p-1">FOB</th><th className="p-1">CFA</th><th className="p-1">%</th><th className="p-1">Prix Revient</th><th className="w-12"></th>
                                </tr></thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {prixReviensFields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="p-1"><Input {...register(`prixReviens.${index}.designation`)} {...compactInputProps}/></td>
                                            <td className="p-1 w-20"><Input type="number" {...register(`prixReviens.${index}.quantite`, { valueAsNumber: true })} {...compactInputProps}/></td>
                                            <td className="p-1 w-24"><Input type="number" {...register(`prixReviens.${index}.fob`, { valueAsNumber: true })} {...compactInputProps}/></td>
                                            <td className="p-1 w-24"><Input type="number" {...register(`prixReviens.${index}.cfa`, { valueAsNumber: true })} {...compactInputProps}/></td>
                                            <td className="p-1 w-16"><Input type="number" {...register(`prixReviens.${index}.percentage`, { valueAsNumber: true })} {...compactInputProps}/></td>
                                            <td className="p-1 w-24"><Input type="number" {...register(`prixReviens.${index}.prixRevient`, { valueAsNumber: true })} {...compactInputProps}/></td>
                                            <td className="p-1 text-center"><button type="button" onClick={() => removePrixRevien(index)} className="text-red-500 p-1 rounded-full hover:bg-red-100"><DeleteIcon className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DynamicTable>
                    </FormSection>

                    <FormSection title="Douanes">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                            <CompactFieldWrapper label="Nom Transit"><Input {...register('nomTransit')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="N° Facture Transit"><Input {...register('numFactureTransit')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Date Facture Transit"><Input type="date" {...register('dateFactureTransit')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Montant Transit"><Input type="number" {...register('montantTransit', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Droit Douane"><Input type="number" {...register('droitDouane', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Droit D. taxe"><Input type="number" {...register('droitDTaxe', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Mt TVA Douane"><Input type="number" {...register('montantTVADouane', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Mt TS Douane"><Input type="number" {...register('montantTSDouane', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Frais Phyto"><Input type="number" {...register('fraisPhyto', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Frais Dépotage"><Input type="number" {...register('fraisDepotage', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="N° CC Transit"><Input {...register('numCCTransit')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="N° Dos. Tran."><Input {...register('numDosTran')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="N° Déclarant"><Input {...register('numDeclarant')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Date Déclarant"><Input type="date" {...register('dateDeclarant')} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Mt TVA Fact. Trans"><Input type="number" {...register('montantTVAFactTrans', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                            <CompactFieldWrapper label="Mt TVA Interv."><Input type="number" {...register('montantTVAInterv', { valueAsNumber: true })} {...compactInputProps} /></CompactFieldWrapper>
                        </div>
                    </FormSection>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="xl:col-span-1">
                     <FormSection title="Détails Administratifs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <DetailAdminSubSection register={register} fieldName="aconnier" title="Aconnier" />
                            <DetailAdminSubSection register={register} fieldName="fret" title="Fret" />
                            <DetailAdminSubSection register={register} fieldName="transport" title="Transport" />
                            <DetailAdminSubSection register={register} fieldName="change" title="Change" />
                            <DetailAdminSubSection register={register} fieldName="surestaire" title="Surestaire" />
                            <DetailAdminSubSection register={register} fieldName="magasinage" title="Magasinage" />
                        </div>
                    </FormSection>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-1">
                    <FormSection title="T.E.U (Conteneurs)">
                        <div className="max-h-28 overflow-y-auto pr-2 space-y-3">
                            {teusFields.map((field, index) => (
                                <div key={field.id} className="flex items-center space-x-2">
                                    <Input {...register(`teus.${index}.numero`)} placeholder={`N° Conteneur ${index + 1}`} {...compactInputProps} />
                                    <button type="button" onClick={() => removeTeu(index)} className="text-red-500 p-1 rounded-full hover:bg-red-100"><DeleteIcon className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={() => appendTeu({ id: `${Date.now()}`, numero: '' })} className="mt-3 flex items-center text-sm font-medium text-primary hover:text-blue-700 transition-colors">
                            <PlusCircleIcon className="mr-2" /> Ajouter un conteneur
                        </button>
                    </FormSection>
                </div>
                <div className="lg:col-span-2">
                    <FormSection title="Règlements">
                        <DynamicTable title="" onAdd={() => appendReglement({ id: `${Date.now()}`, date: '', reference: '', modePaiement: 'Virement', banque: '', montantDevise: 0, devise: 'USD', coursDevise: 0, montantCFA: 0, montantTPS: 0, fraisBancaires: 0 })} addLabel="Ajouter un règlement">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-sidebar-bg text-white"><tr className="text-left text-xs font-medium uppercase">
                                    <th className="px-2 py-1">Date</th>
                                    <th className="px-2 py-1">Réf.</th>
                                    <th className="px-2 py-1">Mode</th>
                                    <th className="px-2 py-1">Banque</th>
                                    <th className="px-2 py-1">Mt Devise</th>
                                    <th className="px-2 py-1">Devise</th>
                                    <th className="px-2 py-1">Cours</th>
                                    <th className="px-2 py-1">Mt CFA</th>
                                    <th className="px-2 py-1">Mt TPS</th>
                                    <th className="px-2 py-1">Frais Banc.</th>
                                    <th className="w-12"></th>
                                </tr></thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {reglementsFields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="p-1"><Input type="date" {...register(`reglements.${index}.date`)} {...compactInputProps} /></td>
                                            <td className="p-1"><Input {...register(`reglements.${index}.reference`)} {...compactInputProps} /></td>
                                            <td className="p-1"><Select {...register(`reglements.${index}.modePaiement`)} {...compactInputProps}><option>Virement</option><option>Chèque</option></Select></td>
                                            <td className="p-1"><Input {...register(`reglements.${index}.banque`)} {...compactInputProps} /></td>
                                            <td className="p-1"><Input type="number" {...register(`reglements.${index}.montantDevise`, { valueAsNumber: true })} {...compactInputProps} /></td>
                                            <td className="p-1"><Select {...register(`reglements.${index}.devise`)} {...compactInputProps}><option>USD</option><option>EUR</option></Select></td>
                                            <td className="p-1"><Input type="number" {...register(`reglements.${index}.coursDevise`, { valueAsNumber: true })} {...compactInputProps} /></td>
                                            <td className="p-1"><Input type="number" {...register(`reglements.${index}.montantCFA`, { valueAsNumber: true })} {...compactInputProps} /></td>
                                            <td className="p-1"><Input type="number" {...register(`reglements.${index}.montantTPS`, { valueAsNumber: true })} {...compactInputProps} /></td>
                                            <td className="p-1"><Input type="number" {...register(`reglements.${index}.fraisBancaires`, { valueAsNumber: true })} {...compactInputProps} /></td>
                                            <td className="p-1 text-center"><button type="button" onClick={() => removeReglement(index)} className="text-red-500 p-1 rounded-full hover:bg-red-100"><DeleteIcon className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </DynamicTable>
                    </FormSection>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-slate-200">
                <button type="button" onClick={() => navigate('/dossiers')} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                    Annuler
                </button>
                <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                    {isEditing ? 'Mettre à jour le dossier' : 'Créer le dossier'}
                </button>
            </div>
        </form>
    );
};

export default DossierFormPage;