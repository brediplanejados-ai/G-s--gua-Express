
import React, { useState } from 'react';
import { Driver, Vehicle } from '../types';

interface DriversListViewProps {
    drivers: Driver[];
    onAddDriver: (driver: Driver) => void;
    onDeleteDriver: (id: string) => void;
    onUpdateDriver: (driver: Driver) => void;
    currentTenantId: string;
}

const DriversListView: React.FC<DriversListViewProps> = ({ drivers, onAddDriver, onDeleteDriver, onUpdateDriver, currentTenantId }) => {
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
        const id = 'd' + Math.random().toString(36).substr(2, 9);
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
        const baseUrl = window.location.origin;
        // Link Mágico com auto-login e tenant
        const link = `${baseUrl}/?driverLogin=${driver.login}&pass=${driver.password}&tenant=${currentTenantId}`;
        const message = `🔥 *OLÁ ${driver.name.toUpperCase()}!* 🔥\n\nBem-vindo ao time *MeuGás Digital*!\n\nAqui está o seu link de acesso exclusivo ao seu Painel de Entregas:\n\n🔗 ${link}\n\n*Ao abrir o link:*\n1. Clique em "Instalar App" para ter o MeuGás na tela inicial do seu celular.\n2. Seus pedidos aparecerão automaticamente.\n3. Lembre-se de ativar o GPS para o rastreio das entregas!\n\nBora subir o nível! 🚀`;
        const cleanPhone = driver.phone.replace(/\D/g, '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-8">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Gestão de Entregadores</h1>
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
                    <p className="text-slate-500 font-medium mb-8">Comece adicionando o primeiro motorista à sua frota.</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-primary font-black uppercase text-xs tracking-widest hover:underline"
                    >
                        Cadastrar agora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map(driver => (
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
                                            capture="user"
                                            onChange={(e) => handleAvatarUpload(driver.id, e)}
                                        />
                                        <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white dark:border-[#1a2c35] ${driver.status === 'available' ? 'bg-green-500' : driver.status === 'busy' ? 'bg-amber-500' : 'bg-slate-300'
                                            }`}></div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white leading-tight">{driver.name}</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{driver.vehicle.plate}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => shareDriverLink(driver)}
                                        className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                        title="Enviar Link de Acesso"
                                    >
                                        <span className="material-symbols-outlined text-xl">share</span>
                                    </button>
                                    <button
                                        onClick={() => openWhatsApp(driver.phone)}
                                        className="size-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                        title="Conversar no WhatsApp"
                                    >
                                        <span className="material-symbols-outlined text-xl icon-fill">chat</span>
                                    </button>
                                    <button
                                        onClick={() => onDeleteDriver(driver.id)}
                                        className="size-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Excluir Motorista"
                                    >
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
                                        <button
                                            onClick={() => setShowVehicleModal(driver.id)}
                                            className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg"
                                        >
                                            ATUALIZAR
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-white/5 pt-4">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">KM Início Turno</p>
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">{driver.vehicle.startShiftKM} km</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">KM Saída Turno</p>
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">{driver.vehicle.endShiftKM} km</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1 bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-500/10">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Próxima Troca Óleo</p>
                                        <p className="text-sm font-black text-amber-700 dark:text-amber-400">{driver.vehicle.nextOilChangeKM} km</p>
                                    </div>
                                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Óleo</p>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2">
                                            <div
                                                className="bg-primary h-full rounded-full"
                                                style={{ width: `${Math.min(100, (driver.vehicle.currentKM / driver.vehicle.nextOilChangeKM) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-[10px] font-bold text-slate-500 space-y-1">
                                <div className="flex justify-between">
                                    <span>Última troca:</span>
                                    <span>{driver.vehicle.lastOilChangeDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Veículo:</span>
                                    <span>{driver.vehicle.model}</span>
                                </div>
                            </div>
                        </div>
                    ))}
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
                                    <input
                                        type="text" required
                                        value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp (DDD+Nº)</label>
                                    <input
                                        type="text" required placeholder="11912345678"
                                        value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login de Acesso</label>
                                    <input
                                        type="text" required
                                        value={newDriver.login} onChange={e => setNewDriver({ ...newDriver, login: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                                    <input
                                        type="password" required
                                        value={newDriver.password} onChange={e => setNewDriver({ ...newDriver, password: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo do Carro</label>
                                    <input
                                        type="text" required
                                        value={newDriver.vehicleModel} onChange={e => setNewDriver({ ...newDriver, vehicleModel: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Placa</label>
                                    <input
                                        type="text" required
                                        value={newDriver.vehiclePlate} onChange={e => setNewDriver({ ...newDriver, vehiclePlate: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button" onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
                                >
                                    SALVAR CADASTRO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vehicle Management Modal */}
            {showVehicleModal && (() => {
                const driver = drivers.find(d => d.id === showVehicleModal)!;
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-[#0b141a]/95 backdrop-blur-md" onClick={() => setShowVehicleModal(null)}></div>
                        <div className="bg-white dark:bg-[#1a2c35] w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-white/5 animate-in slide-in-from-bottom duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black">
                                    {driver.vehicle.plate.slice(-2)}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Gestão de Manutenção</h2>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{driver.vehicle.model}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-[#0b141a] rounded-[1.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">KM Início do Turno</label>
                                        <input
                                            type="number"
                                            defaultValue={driver.vehicle.startShiftKM}
                                            onBlur={(e) => handleUpdateKM(driver.id, parseInt(e.target.value), 'start')}
                                            className="w-full bg-white dark:bg-[#1a2c35] border border-slate-200 dark:border-white/5 rounded-xl p-3 outline-none focus:border-primary font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">KM Atual de Rodagem</label>
                                        <input
                                            type="number"
                                            defaultValue={driver.vehicle.currentKM}
                                            onBlur={(e) => handleUpdateKM(driver.id, parseInt(e.target.value), 'current')}
                                            className="w-full bg-white dark:bg-[#1a2c35] border border-slate-200 dark:border-white/5 rounded-xl p-3 outline-none focus:border-primary font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">KM Saída do Turno</label>
                                        <input
                                            type="number"
                                            defaultValue={driver.vehicle.endShiftKM}
                                            onBlur={(e) => handleUpdateKM(driver.id, parseInt(e.target.value), 'end')}
                                            className="w-full bg-white dark:bg-[#1a2c35] border border-slate-200 dark:border-white/5 rounded-xl p-3 outline-none focus:border-primary font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="p-6 bg-amber-500/5 rounded-[1.5rem] border border-amber-500/10 space-y-4">
                                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Registrar Troca de Óleo</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-slate-400">KM da Troca</p>
                                            <input type="number" placeholder="KM" className="w-full bg-white dark:bg-[#1a2c35] rounded-xl p-2 text-sm outline-none border border-amber-500/20" id="oil-km" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-slate-400">Próxima Troca (+KM)</p>
                                            <input type="number" placeholder="Ex: 5000" className="w-full bg-white dark:bg-[#1a2c35] rounded-xl p-2 text-sm outline-none border border-amber-500/20" id="oil-next" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const kmVal = (document.getElementById('oil-km') as HTMLInputElement).value;
                                            const nextVal = (document.getElementById('oil-next') as HTMLInputElement).value;
                                            if (kmVal && nextVal) {
                                                handleUpdateOil(driver.id, parseInt(kmVal), new Date().toLocaleDateString(), parseInt(kmVal) + parseInt(nextVal));
                                                setShowVehicleModal(null);
                                            }
                                        }}
                                        className="w-full bg-amber-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                                    >
                                        SALVAR MANUTENÇÃO
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Observações do Veículo</label>
                                    <textarea
                                        placeholder="Avarias, multas, reparos necessários..."
                                        defaultValue={driver.vehicle.observations}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white h-24 resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowVehicleModal(null)}
                                className="w-full mt-8 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                FECHAR PAINEL
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default DriversListView;
