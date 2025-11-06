
import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Origine } from '../../types';
import { useOrigines } from '../../context/AppContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { XCircleIcon } from '../../components/icons';

const MySwal = withReactContent(Swal);

type OrigineFormInputs = Omit<Origine, 'id'>;

interface OrigineFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    origineId: string | null;
}

const OrigineFormModal: React.FC<OrigineFormModalProps> = ({ isOpen, onClose, origineId }) => {
    const { getOrigineById, addOrigine, updateOrigine } = useOrigines();
    const isEditing = Boolean(origineId);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<OrigineFormInputs>({
        defaultValues: {
            nomPays: ''
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
            if (isEditing && origineId) {
                const origine = getOrigineById(origineId);
                if (origine) {
                    reset(origine);
                }
            } else {
                reset({ nomPays: '' });
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, origineId, isEditing, getOrigineById, reset, onClose]);

    const onSubmit: SubmitHandler<OrigineFormInputs> = (data) => {
        if (isEditing && origineId) {
            updateOrigine({ ...data, id: origineId });
        } else {
            addOrigine(data);
        }
        
        onClose();
        MySwal.fire({
            title: 'Succès !',
            text: `L'origine a été ${isEditing ? 'mise à jour' : 'créée'} avec succès.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#334155',
            color: '#f8fafc'
        });
    };

    const FieldWrapper: React.FC<{ label: string; htmlFor: keyof OrigineFormInputs; error?: string; children: React.ReactNode }> = ({ label, htmlFor, error, children }) => (
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-md transform animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 bg-primary text-white rounded-t-xl">
                    <h2 className="text-xl font-bold">
                        {isEditing ? "Modifier l'origine" : "Créer une nouvelle origine"}
                    </h2>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors" aria-label="Fermer">
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                 
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <FieldWrapper label="Nom du pays" htmlFor="nomPays" error={errors.nomPays?.message}>
                            <input
                                id="nomPays"
                                type="text"
                                {...register('nomPays', { required: "Le nom du pays est requis" })}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.nomPays ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-primary'}`}
                            />
                        </FieldWrapper>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 p-5 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                            {isEditing ? 'Mettre à jour' : "Créer l'origine"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrigineFormModal;