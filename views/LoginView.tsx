
import React, { useState } from 'react';
import { AdminUser, Driver } from '../types';

interface LoginViewProps {
    onLogin: (credentials: { login: string; pass: string; type: 'admin' | 'driver' }) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
    const [loginType, setLoginType] = useState<'admin' | 'driver'>('admin');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin({ login, pass: password, type: loginType });
    };

    const handleRecovery = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Um link de recuperação foi enviado para ${recoveryEmail}`);
        setShowForgot(false);
    };

    return (
        <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-4 font-body">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 shadow-2xl shadow-primary/20">
                        <span className="material-symbols-outlined text-5xl icon-fill">local_fire_department</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Gás & Água Express</h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Tecnologia Logística Digital</p>
                </div>

                <div className="bg-[#1a2c35] rounded-[2.5rem] p-8 shadow-2xl border border-white/5 relative overflow-hidden">
                    {/* Glassmorphism accent */}
                    <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>

                    {!showForgot ? (
                        <>
                            {/* Type Switcher */}
                            <div className="flex bg-[#0b141a] p-1.5 rounded-2xl mb-8 relative z-10">
                                <button
                                    onClick={() => setLoginType('admin')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${loginType === 'admin' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    ADMINISTRATIVO
                                </button>
                                <button
                                    onClick={() => setLoginType('driver')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${loginType === 'driver' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    ENTREGADOR
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Usuário / Login</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">person</span>
                                        <input
                                            type="text"
                                            value={login}
                                            onChange={(e) => setLogin(e.target.value)}
                                            placeholder="seu_usuario"
                                            className="w-full bg-[#0b141a] border border-white/5 focus:border-primary/50 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold placeholder:text-slate-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha de Acesso</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowForgot(true)}
                                            className="text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                                        >
                                            Esqueci a senha
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-[#0b141a] border border-white/5 focus:border-primary/50 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold placeholder:text-slate-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                                >
                                    <span className="material-symbols-outlined">login</span>
                                    ENTRAR NO SISTEMA
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="animate-in slide-in-from-right duration-300 relative z-10">
                            <button
                                onClick={() => setShowForgot(false)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-xs font-bold"
                            >
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                VOLTAR PARA O LOGIN
                            </button>

                            <h2 className="text-2xl font-black text-white mb-2">Recuperar Conta</h2>
                            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                                Digite seu e-mail cadastrado. Enviaremos um código para redefinir sua senha de acesso.
                            </p>

                            <form onSubmit={handleRecovery} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail de Cadastro</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                                        <input
                                            type="email"
                                            value={recoveryEmail}
                                            onChange={(e) => setRecoveryEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            className="w-full bg-[#0b141a] border border-white/5 focus:border-primary/50 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold placeholder:text-slate-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-white text-slate-900 py-5 rounded-[1.5rem] font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                    ENVIAR E-MAIL
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <p className="text-center text-slate-500 text-[10px] font-bold mt-8 uppercase tracking-[0.2em] opacity-50">
                    © 2026 LOGÍSTICA EXPRESS • VERSÃO 2.4.0
                </p>
            </div>
        </div>
    );
};

export default LoginView;
