
import React, { useState } from 'react';
import { Tenant } from '../types';

interface SuperAdminViewProps {
    tenants: Tenant[];
    onAddTenant: (tenant: Tenant) => void;
    onUpdateTenant: (tenant: Tenant) => void;
    onDeleteTenant: (id: string) => void;
    stats: {
        totalOrdersCount: number;
        activeDriversCount: number;
    };
    onLogout: () => void;
    globalLogo: string | null;
    onUpdateGlobalLogo: (logo: string | null) => void;
}

const SuperAdminView: React.FC<SuperAdminViewProps> = ({ tenants, onAddTenant, onUpdateTenant, onDeleteTenant, stats, onLogout, globalLogo, onUpdateGlobalLogo }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'security' | 'billing'>('overview');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPassId, setShowPassId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const [newTenant, setNewTenant] = useState({
        id: '',
        name: '',
        adminLogin: '',
        adminPassword: '',
        plan: 'Free' as 'Free' | 'Pro' | 'Enterprise',
        billingDay: 10
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const tenant: Tenant = {
            ...newTenant,
            status: 'Ativo',
            createdAt: new Date().toISOString().split('T')[0],
            maxUsers: newTenant.plan === 'Free' ? 3 : (newTenant.plan === 'Pro' ? 10 : 999),
            backupEnabled: true,
            storageEnabled: true,
            apiEnabled: true,
            databaseSize: '0.5 MB'
        };
        onAddTenant(tenant);
        setShowAddModal(false);
        setNewTenant({ id: '', name: '', adminLogin: '', adminPassword: '', plan: 'Free', billingDay: 10 });
    };

    const toggleFeature = (tenant: Tenant, feature: 'backupEnabled' | 'storageEnabled' | 'apiEnabled') => {
        onUpdateTenant({ ...tenant, [feature]: !tenant[feature] });
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#0b141a] text-white overflow-hidden">
            {/* Sidebar do Criador */}
            <aside className="w-72 bg-[#1a2c35] border-r border-white/5 flex flex-col p-6 overflow-y-auto shrink-0">
                <div className="flex flex-col items-center gap-4 mb-12 px-2">
                    {globalLogo ? (
                        <div className="w-full flex justify-center mb-4">
                            <img src={globalLogo} alt="Global Logo" className="h-12 object-contain" />
                        </div>
                    ) : (
                        <div className="size-16 bg-primary/20 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/20">
                            <span className="material-symbols-outlined text-primary text-4xl">water_drop</span>
                        </div>
                    )}
                    <div className="text-center">
                        <h1 className="text-sm font-black uppercase tracking-tight">Painel Mestre</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Criador do Sistema</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-2">Principal</p>
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'overview' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-xl">grid_view</span>
                        Visão Geral
                    </button>
                    <button onClick={() => setActiveTab('tenants')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'tenants' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-xl">business</span>
                        Assinantes
                    </button>

                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-8 mb-4 ml-2">Monitoramento</p>
                    <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'security' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-xl">security</span>
                        Segurança & Logs
                    </button>
                    <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${activeTab === 'billing' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-xl">payments</span>
                        Financeiro SaaS
                    </button>
                </nav>

                <div className="mt-auto space-y-4 pt-8">
                    <div className="bg-[#0b141a] p-4 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase text-slate-500">Uso de CPU</span>
                            <span className="text-[9px] font-black text-emerald-500">12%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[12%]"></div>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black text-xs uppercase tracking-widest border border-red-500/10">
                        <span className="material-symbols-outlined text-xl">logout</span>
                        Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        <header className="mb-12 flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black">DashBoard do Criador</h1>
                                <p className="text-slate-500 font-bold mt-2">Métricas e performance de toda a rede Express.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-[#1a2c35] p-5 rounded-3xl border border-white/5 flex flex-col items-center min-w-[140px]">
                                    <span className="text-[10px] font-black text-slate-500 uppercase text-center mb-1">Total Pedidos</span>
                                    <span className="text-2xl font-black text-emerald-500">{stats.totalOrdersCount}</span>
                                </div>
                                <div className="bg-[#1a2c35] p-5 rounded-3xl border border-white/5 flex flex-col items-center min-w-[140px]">
                                    <span className="text-[10px] font-black text-slate-500 uppercase text-center mb-1">Entregadores</span>
                                    <span className="text-2xl font-black text-amber-500">{stats.activeDriversCount}</span>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-[#1a2c35] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                                <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">image</span>
                                    Logo do Sistema
                                </h3>
                                <input
                                    type="file" id="global-logo" className="hidden" accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => onUpdateGlobalLogo(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <label htmlFor="global-logo" className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-3xl cursor-pointer hover:border-primary/50 transition-all bg-[#0b141a]/50">
                                    {globalLogo ? (
                                        <img src={globalLogo} alt="Logo Prev" className="h-16 object-contain mb-4" />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">add_a_photo</span>
                                    )}
                                    <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-primary transition-colors">Trocar Identidade</span>
                                </label>
                                {globalLogo && (
                                    <button onClick={() => onUpdateGlobalLogo(null)} className="mt-4 text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest w-full">Remover Logotipo</button>
                                )}
                            </div>

                            <div className="bg-[#1a2c35] p-8 rounded-[2.5rem] border border-white/5">
                                <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">campaign</span>
                                    Broadcast Global
                                </h3>
                                <textarea placeholder="Digite um aviso para todos os lojistas..." className="w-full bg-[#0b141a] border border-white/10 rounded-2xl p-5 text-sm font-bold min-h-[120px] outline-none focus:border-primary transition-all resize-none mb-4"></textarea>
                                <button className="w-full bg-amber-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 transition-all">Disparar Aviso</button>
                            </div>

                            <div className="bg-[#1a2c35] p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">settings_suggest</span>
                                    Configurações SaaS
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-[#0b141a] rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-300">Modo Manutenção</p>
                                            <p className="text-[9px] font-bold text-slate-500 italic">Bloqueia todos os acessos</p>
                                        </div>
                                        <button
                                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                                            className={`size-10 rounded-xl flex items-center justify-center transition-all ${maintenanceMode ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{maintenanceMode ? 'toggle_on' : 'toggle_off'}</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-[#0b141a] rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-300">Registro Público</p>
                                            <p className="text-[9px] font-bold text-slate-500 italic">Permite novos cadastros auto</p>
                                        </div>
                                        <button className="size-10 bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-xl">toggle_off</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tenants' && (
                    <div className="animate-in slide-in-from-right duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-widest">Gestão de Assinantes</h2>
                                <p className="text-slate-500 font-bold text-xs mt-1">Configure permissões individuais para cada empresa.</p>
                            </div>
                            <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-emerald-600/20">
                                <span className="material-symbols-outlined">add_business</span>
                                ADICIONAR LOJA
                            </button>
                        </div>

                        <div className="bg-[#1a2c35] rounded-[2.5rem] border border-white/5 overflow-hidden">
                            <div className="p-8 border-b border-white/5">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                                    <input
                                        type="text"
                                        placeholder="Filtrar por nome ou ID..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full md:w-80 bg-[#0b141a] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#0b141a]/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                            <th className="px-8 py-6">ID / EMPRESA</th>
                                            <th className="px-8 py-6">CREDENCIAIS</th>
                                            <th className="px-8 py-6">PERMISSÕES & DADOS</th>
                                            <th className="px-8 py-6">STATUS</th>
                                            <th className="px-8 py-6 text-right">AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredTenants.map(t => (
                                            <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-8 py-8">
                                                    <p className="font-black text-sm">{t.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase">{t.id} • {t.plan}</p>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-1">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase">Login: <span className="text-slate-300">{t.adminLogin}</span></p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase">Senha:
                                                                <span className="text-white ml-1">{showPassId === t.id ? t.adminPassword : '••••••••'}</span>
                                                            </p>
                                                            <button onClick={() => setShowPassId(showPassId === t.id ? null : t.id)} className="text-primary hover:text-white"><span className="material-symbols-outlined text-sm">{showPassId === t.id ? 'visibility_off' : 'visibility'}</span></button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <button
                                                            onClick={() => toggleFeature(t, 'backupEnabled')}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all flex items-center gap-1.5 ${t.backupEnabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">{t.backupEnabled ? 'backup' : 'cloud_off'}</span>
                                                            Backup
                                                        </button>
                                                        <button
                                                            onClick={() => toggleFeature(t, 'storageEnabled')}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all flex items-center gap-1.5 ${t.storageEnabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">{t.storageEnabled ? 'folder' : 'folder_off'}</span>
                                                            Docs/Files
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary w-[30%]"></div>
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-500 uppercase">DB: {t.databaseSize || '0.1MB'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-2 ${t.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        <div className={`size-1.5 rounded-full ${t.status === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        {t.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => onUpdateTenant({ ...t, status: t.status === 'Ativo' ? 'Bloqueado' : 'Ativo' })} className={`size-10 rounded-xl flex items-center justify-center transition-all ${t.status === 'Ativo' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500'} hover:text-white`}><span className="material-symbols-outlined">{t.status === 'Ativo' ? 'block' : 'check_circle'}</span></button>
                                                        <button onClick={() => confirm(`Excluir permanentemente ${t.name}? Todos os arquivos e dados serão deletados.`) && onDeleteTenant(t.id)} className="size-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined whitespace-nowrap">delete_forever</span></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-full text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-700 mb-6">lock_reset</span>
                        <h2 className="text-xl font-black uppercase tracking-widest text-slate-500">Módulo de Segurança em Desenvolvimento</h2>
                        <p className="text-slate-600 font-bold mt-2 text-sm">Bloqueio automático de IPs, Firewall por Tenant e auditoria avançada.</p>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-full text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-700 mb-6">receipt_long</span>
                        <h2 className="text-xl font-black uppercase tracking-widest text-slate-500">Módulo Financeiro SaaS em Desenvolvimento</h2>
                        <p className="text-slate-600 font-bold mt-2 text-sm">Controle de faturas, integração com Gateway de Pagamento e métricas Churn/MRR.</p>
                    </div>
                )}
            </main>

            {/* Modal de Adição Reutilizado */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0b141a]/95 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
                    <form onSubmit={handleCreate} className="bg-[#1a2c35] w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 p-10 border border-white/5 animate-in zoom-in-95">
                        <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500">add_business</span>
                            Nova Instância SaaS
                        </h3>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Nome Fantasia</label>
                                <input type="text" required value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })} className="w-full bg-[#0b141a] border border-white/5 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">ID da Empresa (ID Login)</label>
                                <input type="text" required value={newTenant.id} onChange={e => setNewTenant({ ...newTenant, id: e.target.value.toUpperCase() })} className="w-full bg-[#0b141a] border border-white/5 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all uppercase" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Admin Login</label>
                                <input type="text" required value={newTenant.adminLogin} onChange={e => setNewTenant({ ...newTenant, adminLogin: e.target.value })} className="w-full bg-[#0b141a] border border-white/5 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Admin Senha</label>
                                <input type="text" required value={newTenant.adminPassword} onChange={e => setNewTenant({ ...newTenant, adminPassword: e.target.value })} className="w-full bg-[#0b141a] border border-white/5 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Plano Mensal</label>
                                <select value={newTenant.plan} onChange={e => setNewTenant({ ...newTenant, plan: e.target.value as any })} className="w-full bg-[#0b141a] border border-white/5 rounded-2xl p-4 font-bold outline-none appearance-none focus:border-emerald-500 transition-all">
                                    <option value="Free">Gratuito</option>
                                    <option value="Pro">Profissional (R$ 99)</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Dia Vencimento</label>
                                <input type="number" min="1" max="28" value={newTenant.billingDay} onChange={e => setNewTenant({ ...newTenant, billingDay: parseInt(e.target.value) })} className="w-full bg-[#0b141a] border border-white/5 rounded-2xl p-4 font-bold outline-none focus:border-emerald-500 transition-all" />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-5 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-white/5 rounded-2xl">Cancelar</button>
                            <button type="submit" className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Gerar Instância</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SuperAdminView;
