import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Stepper from '../../components/ui/Stepper';
import { FiUploadCloud, FiArrowLeft } from 'react-icons/fi';

// Komponen File Input Kustom
const CustomFileInput = ({ label, required, onChange, fileName }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                    <label htmlFor={label} className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload sebuah file</span>
                        <input id={label} name={label} type="file" className="sr-only" onChange={onChange} required={required} />
                    </label>
                    <p className="pl-1">atau seret dan lepas</p>
                </div>
                {fileName ? (
                    <p className="text-sm text-green-600 font-semibold">{fileName}</p>
                ) : (
                    <p className="text-xs text-gray-500">PNG, JPG, PDF hingga 10MB</p>
                )}
            </div>
        </div>
    </div>
);


const RegisterBarbershopPage = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        opening_hours: {
            Senin: { buka: '09:00', tutup: '21:00', aktif: true },
            Selasa: { buka: '09:00', tutup: '21:00', aktif: true },
            Rabu: { buka: '09:00', tutup: '21:00', aktif: true },
            Kamis: { buka: '09:00', tutup: '21:00', aktif: true },
            Jumat: { buka: '09:00', tutup: '21:00', aktif: true },
            Sabtu: { buka: '10:00', tutup: '22:00', aktif: true },
            Minggu: { buka: '', tutup: '', aktif: false },
        },
    });
    const [ktpFile, setKtpFile] = useState(null);
    const [permitFile, setPermitFile] = useState(null);

    const steps = [{ name: 'Informasi Dasar' }, { name: 'Jam Operasional' }, { name: 'Dokumen' }];

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handlePrev = () => setCurrentStep(prev => prev - 1);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleTimeChange = (day, type, value) => {
        setFormData(prev => ({
            ...prev,
            opening_hours: {
                ...prev.opening_hours,
                [day]: { ...prev.opening_hours[day], [type]: value }
            }
        }));
    };
    
    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            opening_hours: {
                ...prev.opening_hours,
                [day]: { ...prev.opening_hours[day], aktif: !prev.opening_hours[day].aktif }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const finalFormData = new FormData();
        finalFormData.append('name', formData.name);
        finalFormData.append('address', formData.address);
        finalFormData.append('city', formData.city);
        finalFormData.append('opening_hours', JSON.stringify(formData.opening_hours));
        if (ktpFile) finalFormData.append('ktp', ktpFile);
        if (permitFile) finalFormData.append('permit', permitFile);
        
        try {
            await api.post('/barbershops/register', finalFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Pendaftaran barbershop berhasil! Data Anda sedang direview oleh Admin.');
            navigate('/dashboard'); // <-- Diarahkan ke dashboard utama
        } catch (err) {
            setError(err.response?.data?.message || 'Pendaftaran gagal. Periksa kembali data Anda.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                    <FiArrowLeft className="mr-2" />
                    Kembali ke Halaman Sebelumnya
                </button>
            </div>
            <h1 className="text-3xl font-bold text-center mb-8">Daftarkan Barbershop Anda</h1>
            <div className="mb-12 flex justify-center">
                <Stepper steps={steps} currentStep={currentStep} />
            </div>

            <div className="p-8 bg-white rounded-lg shadow-lg">
                <form onSubmit={handleSubmit}>
                    {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}

                    {currentStep === 0 && (
                        <div className="space-y-4">
                             <h2 className="text-xl font-semibold">Langkah 1: Informasi Dasar</h2>
                            <input name="name" placeholder="Nama Barbershop" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                            <textarea name="address" placeholder="Alamat Lengkap" value={formData.address} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                            <input name="city" placeholder="Kota" value={formData.city} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md" />
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                             <h2 className="text-xl font-semibold mb-4">Langkah 2: Jam Operasional</h2>
                             <div className="space-y-3">
                                {Object.keys(formData.opening_hours).map(day => (
                                    <div key={day} className="grid grid-cols-4 gap-2 items-center">
                                        <label className="flex items-center">
                                            <input type="checkbox" checked={formData.opening_hours[day].aktif} onChange={() => handleDayToggle(day)} className="h-4 w-4 rounded text-indigo-600"/>
                                            <span className="ml-2 font-medium">{day}</span>
                                        </label>
                                        <input type="time" value={formData.opening_hours[day].buka} onChange={(e) => handleTimeChange(day, 'buka', e.target.value)} disabled={!formData.opening_hours[day].aktif} className="px-3 py-2 border rounded-md disabled:bg-gray-100"/>
                                        <span>-</span>
                                        <input type="time" value={formData.opening_hours[day].tutup} onChange={(e) => handleTimeChange(day, 'tutup', e.target.value)} disabled={!formData.opening_hours[day].aktif} className="px-3 py-2 border rounded-md disabled:bg-gray-100"/>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    
                    {currentStep === 2 && (
                         <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Langkah 3: Dokumen Verifikasi</h2>
                            <CustomFileInput label="ktp" required={true} onChange={(e) => setKtpFile(e.target.files[0])} fileName={ktpFile?.name} />
                            <CustomFileInput label="permit" required={true} onChange={(e) => setPermitFile(e.target.files[0])} fileName={permitFile?.name} />
                         </div>
                    )}
                    
                    <div className="flex justify-between mt-8">
                        {currentStep > 0 && (
                            <button type="button" onClick={handlePrev} className="px-6 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Kembali
                            </button>
                        )}
                        <div/>
                        {currentStep < steps.length - 1 && (
                            <button type="button" onClick={handleNext} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                Lanjutkan
                            </button>
                        )}
                        {currentStep === steps.length - 1 && (
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400">
                                {isSubmitting ? 'Mengirim...' : 'Selesaikan Pendaftaran'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterBarbershopPage;