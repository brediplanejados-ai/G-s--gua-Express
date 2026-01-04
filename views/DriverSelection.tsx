import React from 'react';
import { Driver } from '../types';

interface DriverSelectionProps {
    drivers: Driver[];
    onSelectDriver: (driverId: string) => void;
    onBack?: () => void;
}

const DriverSelectionView: React.FC<DriverSelectionProps> = ({ drivers, onSelectDriver, onBack }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b141a] p-6 min-h-screen relative">
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    VOLTAR AO DASHBOARD
                </button>
            )}
            <div className="max-w-4xl w-full">
                <header className="text-center mb-12">
                    <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-xl shadow-primary/10 border-2 border-primary/20">
                        <span className="material-symbols-outlined text-5xl icon-fill">two_wheeler</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Painel do Entregador</h1>
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Selecione seu perfil para iniciar o turno</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {drivers.map((driver) => (
                        <button
                            key={driver.id}
                            onClick={() => onSelectDriver(driver.id)}
                            className="group relative bg-white dark:bg-[#1a2c35] p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all text-left shadow-sm hover:shadow-2xl hover:-translate-y-1 flex gap-6 items-center"
                        >
                            <div className="relative">
                                <img src={driver.avatar} className="size-20 rounded-2xl object-cover border-4 border-slate-50 dark:border-slate-800 group-hover:border-primary/10 transition-colors" alt={driver.name} />
                                <div className="absolute -bottom-2 -right-2 size-8 bg-green-500 rounded-xl border-4 border-white dark:border-[#1a2c35] flex items-center justify-center shadow-lg">
                                    <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{driver.name}</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                        {driver.vehicle.model}
                                    </div>
                                    <div className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        Placa: {driver.vehicle.plate}
                                    </div>
                                </div>
                            </div>

                            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-[#101c22] flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                <span className="material-symbols-outlined text-3xl font-black">arrow_forward</span>
                            </div>
                        </button>
                    ))}
                </div>

                <footer className="mt-16 text-center">
                    <p className="text-slate-400 text-xs font-bold leading-relaxed mb-6">
                        © 2026 Gás & Água Express - Tecnologia Logística<br />
                        Sua sessão será monitorada via GPS para otimização de rotas.
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-[#1a2c35] px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                            <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                            Acesso Seguro
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-[#1a2c35] px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                            <span className="material-symbols-outlined text-[#33ccff] text-[18px]">navigation</span>
                            Waze Sync
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DriverSelectionView;
