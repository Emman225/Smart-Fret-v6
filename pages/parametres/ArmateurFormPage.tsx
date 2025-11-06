
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Armateur } from '../../types';
import { useArmateurs } from '../../context/AppContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

type ArmateurFormInputs = Omit<Armateur, 'id'>;

const ArmateurFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getArmateurById, addArmateur, updateArmateur } = useArmateurs();
    const isEditing = Boolean(id);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ArmateurFormInputs>();

    useEffect(() => {
        if (isEditing && id) {
            const armateur = getArmateurById(id);
            if (armateur) {
                reset(armateur);
            }
        }
    }, [id, isEditing, getArmateurById, reset]);

    const onSubmit: SubmitHandler<ArmateurFormInputs> = (data) => {
        if (isEditing && id) {
            updateArmateur({ ...data, id });
        } else {
            addArmateur(data);
        }
        
        MySwal.fire({
            title: 'Succès !',
            text: `L'armateur a été ${isEditing ? 'mis à jour' : 'créé'} avec succès.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: '#334155',
            color: '#f8fafc'
        });
        navigate('/parametres/armateur');
    };

    const FieldWrapper: React.FC<{ label: string; htmlFor: keyof ArmateurFormInputs; error?: string; children: React.ReactNode }> = ({ label, htmlFor, error, children }) => (
        <div>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">
                    {isEditing ? "Modifier l'armateur" : "Créer un nouvel armateur"}
                </h1>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200 max-w-2xl mx-auto">
                    <div className="space-y-6">
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
                    <div className="flex justify-end space-x-4 pt-6 mt-8 border-t border-slate-200">
                        <button type="button" onClick={() => navigate('/parametres/armateur')} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
                            Annuler
                        </button>
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                            {isEditing ? 'Mettre à jour' : "Créer l'armateur"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ArmateurFormPage;
