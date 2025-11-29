
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Navire } from '../../types';
import { useNavires } from '../../context/AppContext';
import { useArmateurs } from '../../context/ArmateurContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { XCircleIcon } from '../../components/icons';

const MySwal = withReactContent(Swal);

type NavireFormInputs = Omit<Navire, 'id'>;

interface NavireFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    navireId: string | null;
}

const NavireFormModal: React.FC<NavireFormModalProps> = ({ isOpen, onClose, navireId }) => {
    const { getNavireById, addNavire, updateNavire } = useNavires();
    const { armateurs, fetchArmateurs } = useArmateurs();
    const isEditing = Boolean(navireId);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<NavireFormInputs>({
        defaultValues: {
            nomNavire: '',
            armateurId: ''
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchArmateurs();
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
            if (isEditing && navireId) {
                const navire = getNavireById(navireId);
                if (navire) {
                    reset(navire);
                }
            } else {
                reset({ nomNavire: '', armateurId: '' });
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, navireId, isEditing, getNavireById, reset, onClose]);

    const onSubmit: SubmitHandler<NavireFormInputs> = async (data) => {
        try {
            if (isEditing && navireId) {
                await updateNavire({ ...data, id: navireId });
            } else {
                await addNavire(data);
            }
            onClose();
            MySwal.fire({
                title: 'Succès !',
                text: `Le navire a été ${isEditing ? 'mis à jour' : 'créé'} avec succès.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#334155',
                color: '#f8fafc'
            });
        } catch (error: any) {
            MySwal.fire({
                title: 'Erreur',
                text: error?.message || 'Une erreur est survenue lors de l\'enregistrement du navire',
                icon: 'error',
                background: '#334155',
                color: '#f8fafc'
            });
        }
    };

    const FieldWrapper: React.FC<{ label: string; htmlFor: keyof NavireFormInputs; error?: string; children: React.ReactNode }> = ({ label, htmlFor, error, children }) => (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );

    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 bg-primary text-white rounded-t-xl">
                    <h2 className="text-xl font-bold">
                        {isEditing ? "Modifier le navire" : "Créer un nouveau navire"}
                    </h2>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors" aria-label="Fermer">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                 
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <FieldWrapper label="Armateur" htmlFor="armateurId" error={errors.armateurId?.message}>
                            <select
                                id="armateurId"
                                {...register('armateurId', { required: "L'armateur est requis" })}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.armateurId ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                            >
                                <option value="">Sélectionner un armateur</option>
                                {armateurs
                                    .slice()
                                    .sort((a, b) => a.NomArmat.localeCompare(b.NomArmat))
                                    .map(armateur => (
                                        <option key={armateur.IdArmat} value={String(armateur.IdArmat)}>
                                            {armateur.NomArmat}
                                        </option>
                                    ))}
                            </select>
                        </FieldWrapper>

                        <FieldWrapper label="Nom du navire" htmlFor="nomNavire" error={errors.nomNavire?.message}>
                            <input
                                id="nomNavire"
                                type="text"
                                {...register('nomNavire', { required: "Le nom du navire est requis" })}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.nomNavire ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                            />
                        </FieldWrapper>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 p-5 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                            {isEditing ? 'Mettre à jour' : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NavireFormModal;