
import React, { useState } from 'react';
import { Driver, Order } from '../types';

interface DriversListViewProps {
    drivers: Driver[];
    orders: Order[];
    onAddDriver: (driver: Driver) => void;
    onDeleteDriver: (id: string) => void;
    onUpdateDriver: (driver: Driver) => void;
    currentTenantId: string;
}

const DriversListView: React.FC<DriversListViewProps> = ({ drivers, orders, onAddDriver, onDeleteDriver, onUpdateDriver, currentTenantId }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState<string | null>(null);
    const [newDriver, setNewDriver] = useState({
        name: '',
        login: '',
        password: '',
        email: '',
        phone: '',
        vehicleModel: '',
        vehiclePlate: ''
    });

    const handleAvatarUpload = (driverId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const driver = drivers.find(d => d.id === driverId);
                if (driver) {
                    onUpdateDriver({ ...driver, avatar: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = crypto.randomUUID();
        const driver: Driver = {
            id,
            tenantId: '', // Será preenchido pelo App.tsx
            name: newDriver.name,
            login: newDriver.login,
            password: newDriver.password,
            email: newDriver.email,
            phone: newDriver.phone,
            status: 'offline',
            avatar: `https://i.pravatar.cc/150?u=${id}`,
            vehicle: {
                model: newDriver.vehicleModel,
                plate: newDriver.vehiclePlate,
                type: 'Carro',
                currentKM: 0,
                startShiftKM: 0,
                endShiftKM: 0,
                lastOilChangeKM: 0,
                nextOilChangeKM: 5000,
                lastOilChangeDate: new Date().toLocaleDateString(),
                observations: ''
            }
        };
        onAddDriver(driver);
        setShowAddModal(false);
        setNewDriver({ name: '', login: '', password: '', email: '', phone: '', vehicleModel: '', vehiclePlate: '' });
    };

    const handleUpdateKM = (driverId: string, km: number, type: 'current' | 'start' | 'end') => {
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
            const updatedDriver = {
                ...driver,
                vehicle: {
                    ...driver.vehicle,
                    currentKM: type === 'current' ? km : driver.vehicle.currentKM,
                    startShiftKM: type === 'start' ? km : driver.vehicle.startShiftKM,
                    endShiftKM: type === 'end' ? km : driver.vehicle.endShiftKM,
                }
            };
            onUpdateDriver(updatedDriver);
        }
    };

    const handleUpdateOil = (driverId: string, km: number, date: string, nextKm: number) => {
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
            const updatedDriver = {
                ...driver,
                vehicle: {
                    ...driver.vehicle,
                    lastOilChangeKM: km,
                    lastOilChangeDate: date,
                    nextOilChangeKM: nextKm
                }
            };
            onUpdateDriver(updatedDriver);
        }
    };

    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}`, '_blank');
    };

    const shareDriverLink = (driver: Driver) => {
        // Link para o novo App Dedicado na Vercel
        const driverAppUrl = 'https://meugas-entregador.vercel.app';
        const link = `${driverAppUrl}/?driverLogin=${driver.login}&pass=${driver.password}&tenant=${currentTenantId}`;
        const message = `🔥 *OLÁ ${driver.name.toUpperCase()}!* 🔥\n\nBem-vindo ao novo App exclusivo *MeuGás Entregador*!\n\n🔗 ${link}\n\n*Novidades desta versão:*\n✅ Notificações Instantâneas\n✅ Alerta Sonoro de novo pedido\n✅ Mapa Integrado e GPS\n\nAbra o link e clique em "Instalar" para ter o App na sua tela inicial! 🚀`;
        const cleanPhone = driver.phone.replace(/\D/g, '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-8">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic tracking-tighter uppercase">Gestão de Entregadores</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                        {drivers.length} Motoristas Ativos na Frota
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined">add</span>
                    NOVO ENTREGADOR
                </button>
            </header>

            {drivers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a2c35] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
                        <span className="material-symbols-outlined text-4xl">no_accounts</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Nenhum entregador cadastrado</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-primary font-black uppercase text-xs tracking-widest hover:underline"
                    >
                        Cadastrar agora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map(driver => {
                        const driverCompletedToday = orders.filter(o => o.driver === driver.name && o.status === 'Entregue' && o.date === today);
                        const totalGains = driverCompletedToday.reduce((acc, curr) => acc + curr.total, 0);

                        return (
                            <div key={driver.id} className="bg-white dark:bg-[#1a2c35] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 group hover:shadow-2xl transition-all relative overflow-hidden">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="relative group cursor-pointer" onClick={() => document.getElementById(`avatar-input-${driver.id}`)?.click()}>
                                            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <span className="material-symbols-outlined text-white text-xl">add_a_photo</span>
                                            </div>
                                            <img src={driver.avatar} className="size-14 rounded-2xl object-cover" alt={driver.name} />
                                            <input
                                                type="file"
                                                id={`avatar-input-${driver.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleAvatarUpload(driver.id, e)}
                                            />
                                            <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white dark:border-[#1a2c35] ${driver.status === 'available' ? 'bg-green-500' : driver.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white leading-tight">{driver.name}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{driver.vehicle.plate}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => shareDriverLink(driver)} className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-xl">share</span>
                                        </button>
                                        <button onClick={() => onDeleteDriver(driver.id)} className="size-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-slate-50 dark:bg-[#0b141a] p-5 rounded-2xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary">speed</span>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KM Atual</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{driver.vehicle.currentKM} km</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowVehicleModal(driver.id)} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg">
                                                ATUALIZAR
                                            </button>
                                        </div>
                                    </div>

                                    {/* Resumo Financeiro no Card */}
                                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Ganhos de Hoje</span>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Produção</p>
                                                <p className="text-lg font-black text-white">{driverCompletedToday.length} Entregas</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-primary uppercase mb-0.5">Total Bruto</p>
                                                <p className="text-2xl font-black text-primary">R$ {totalGains.toFixed(0)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-[10px] font-bold text-slate-500 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Última troca óleo:</span>
                                        <span>{driver.vehicle.lastOilChangeDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Veículo:</span>
                                        <span>{driver.vehicle.model}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Driver Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0b141a]/95 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white dark:bg-[#1a2c35] w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-white/5 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Cadastrar Novo Entregador</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                    <input type="text" required value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                                    <input type="text" required value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login</label>
                                    <input type="text" required value={newDriver.login} onChange={e => setNewDriver({ ...newDriver, login: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                                    <input type="password" required value={newDriver.password} onChange={e => setNewDriver({ ...newDriver, password: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo</label>
                                    <input type="text" required value={newDriver.vehicleModel} onChange={e => setNewDriver({ ...newDriver, vehicleModel: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Placa</label>
                                    <input type="text" required value={newDriver.vehiclePlate} onChange={e => setNewDriver({ ...newDriver, vehiclePlate: e.target.value })} className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">CANCELAR</button>
                                <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95">SALVAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Maintenance Modal */}
            {showVehicleModal && (() => {
                const driver = drivers.find(d => d.id === showVehicleModal)!;
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#0b141a]/95 backdrop-blur-md" onClick={() => setShowVehicleModal(null)}></div>
                        <div className="bg-white dark:bg-[#1a2c35] w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-white/5 animate-in slide-in-from-bottom duration-300">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Atualizar KM {driver.name}</h2>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KM Atual</label>
                                    <input type="number" defaultValue={driver.vehicle.currentKM} onBlur={(e) => handleUpdateKM(driver.id, parseInt(e.target.value), 'current')} className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-xl p-4 outline-none focus:border-primary font-bold" />
                                </div>
                                <button onClick={() => setShowVehicleModal(null)} className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">FECHAR</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default DriversListView;
