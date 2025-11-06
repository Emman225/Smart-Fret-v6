
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Armateur } from '../../types';
import { useArmateurs } from '../../context/AppContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { XCircleIcon } from '../../components/icons';

const MySwal = withReactContent(Swal);

type ArmateurFormInputs = Omit<Armateur, 'id'>;

interface ArmateurFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    armateurId: string | null;
}

const ArmateurFormModal: React.FC<ArmateurFormModalProps> = ({ isOpen, onClose, armateurId }) => {
    const { getArmateurById, addArmateur, updateArmateur } = useArmateurs();
    const isEditing = Boolean(armateurId);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ArmateurFormInputs>({
        defaultValues: {
            armateur: '',
            contact: '',
            email: ''
        }
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleKeyDown);
            if (isEditing && armateurId) {
                const armateur = getArmateurById(armateurId);
                if (armateur) {
                    reset(armateur);
                }
            } else {
                reset();
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, armateurId, isEditing, getArmateurById, reset, onClose]);

    const onSubmit: SubmitHandler<ArmateurFormInputs> = (data) => {
        if (isEditing && armateurId) {
            updateArmateur({ ...data, id: armateurId });
        } else {
            addArmateur(data);
        }
        
        onClose();
        MySwal.fire({
            title: 'Succès !',
            text: `L'armateur a été ${isEditing ? 'mis à jour' : 'créé'} avec succès.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#334155',
            color: '#f8fafc'
        });
    };

    const FieldWrapper: React.FC<{ label: string; htmlFor: keyof ArmateurFormInputs; error?: string; children: React.ReactNode }> = ({ label, htmlFor, error, children }) => (
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 bg-primary text-white rounded-t-xl">
                    <h2 className="text-xl font-bold">
                        {isEditing ? "Modifier l'armateur" : "Créer un nouvel armateur"}
                    </h2>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors" aria-label="Fermer">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                 
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <FieldWrapper label="Nom de l'armateur" htmlFor="armateur" error={errors.armateur?.message}>
                            <input
                                id="armateur"
                                type="text"
                                {...register('armateur', { required: "Le nom de l'armateur est requis" })}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.armateur ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Contact" htmlFor="contact" error={errors.contact?.message}>
                            <input
                                id="contact"
                                type="tel"
                                {...register('contact')}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.contact ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
                            <input
                                id="email"
                                type="email"
                                {...register('email', { 
                                    required: "L'email est requis",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Adresse email invalide"
                                    }
                                })}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                            />
                        </FieldWrapper>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 p-5 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                            {isEditing ? 'Mettre à jour' : "Créer l'armateur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArmateurFormModal;