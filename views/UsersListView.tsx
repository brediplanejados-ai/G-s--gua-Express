
import React, { useState } from 'react';
import { AdminUser, AccessLog } from '../types';

interface UsersListViewProps {
    users: AdminUser[];
    accessLogs: AccessLog[];
    onAddUser: (user: AdminUser) => void;
    onDeleteUser: (id: string) => void;
    isAdmin: boolean;
}

const UsersListView: React.FC<UsersListViewProps> = ({ users, accessLogs, onAddUser, onDeleteUser, isAdmin }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'logs'>('list');
    const [newUser, setNewUser] = useState({
        name: '',
        login: '',
        password: '',
        email: '',
        role: 'operator' as 'admin' | 'operator'
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const user: AdminUser = {
            id: 'u' + Math.random().toString(36).substr(2, 9),
            ...newUser,
            avatar: `https://i.pravatar.cc/150?u=${newUser.login}`
        };
        onAddUser(user);
        setShowAddModal(false);
        setNewUser({ name: '', login: '', password: '', email: '', role: 'operator' });
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-8">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Gestão de Colaboradores</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                        {users.length} Usuários com Acesso ao Painel
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        NOVO COLABORADOR
                    </button>
                )}
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white dark:bg-[#1a2c35] text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Lista de Usuários
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-white dark:bg-[#1a2c35] text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Histórico de Acessos
                    </button>
                )}
            </div>

            {activeTab === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                        <div key={user.id} className="bg-white dark:bg-[#1a2c35] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={user.avatar} className="size-14 rounded-2xl object-cover" alt={user.name} />
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 dark:text-white leading-tight">{user.name}</h3>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        {user.role === 'admin' ? 'Administrador' : 'Operador'}
                                    </span>
                                </div>
                                {isAdmin && user.id !== 'a1' && (
                                    <button
                                        onClick={() => onDeleteUser(user.id)}
                                        className="size-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 italic text-sm">
                                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                                    <span className="material-symbols-outlined text-sm">login</span>
                                    Login: {user.login}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a2c35] rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#0b141a]">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horário</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {accessLogs.slice().reverse().map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                                                {log.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{log.userName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{log.userRole}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.type === 'login' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {log.type === 'login' ? 'Entrou' : 'Saiu'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">{log.date}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">{log.timestamp}</td>
                                </tr>
                            ))}
                            {accessLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                                        Nenhum log de acesso registrado ainda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0b141a]/95 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white dark:bg-[#1a2c35] w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-white/5 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Novo Colaborador</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                    <input
                                        type="text" required
                                        value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                                    <input
                                        type="email" required
                                        value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login de Acesso</label>
                                    <input
                                        type="text" required
                                        value={newUser.login} onChange={e => setNewUser({ ...newUser, login: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha Provisória</label>
                                    <input
                                        type="text" required
                                        value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#0b141a] border border-slate-100 dark:border-white/5 rounded-2xl p-4 outline-none focus:border-primary transition-all font-bold text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Acesso</label>
                                <div className="flex bg-slate-50 dark:bg-[#0b141a] p-1.5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setNewUser({ ...newUser, role: 'operator' })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${newUser.role === 'operator' ? 'bg-white dark:bg-[#1a2c35] text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        OPERADOR
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewUser({ ...newUser, role: 'admin' })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${newUser.role === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        ADMINISTRADOR
                                    </button>
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
                                    CRIAR ACESSO
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersListView;
