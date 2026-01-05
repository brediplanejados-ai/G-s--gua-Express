
import React, { useState } from 'react';
import { AdminUser, Driver } from '../types';

interface LoginViewProps {
    onLogin: (credentials: { login: string; pass: string; type: 'admin' | 'driver' | 'creator'; tenantId?: string }) => void;
    globalLogo: string | null;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, globalLogo }) => {
    const [loginType] = useState<'admin' | 'driver'>('admin');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [tenantId, setTenantId] = useState('t1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!login || !password || !tenantId) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        onLogin({ login, pass: password, type: loginType, tenantId });
    };

    const handleRecovery = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Um link de recuperação foi enviado para ${recoveryEmail}`);
        setShowForgot(false);
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#0b141a] flex items-center justify-center p-4 lg:p-8 overflow-y-auto scrollbar-hide py-10">
            <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center">
                {/* Logo e Header */}
                <div className="text-center mb-8 lg:mb-12">
                    {globalLogo ? (
                        <img src={globalLogo} alt="Logo" className="h-16 lg:h-20 object-contain mx-auto mb-6" />
                    ) : (
                        <div className="size-16 lg:size-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
                            <span className="material-symbols-outlined text-primary text-4xl lg:text-5xl">water_drop</span>
                        </div>
                    )}
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">Gás & Água Express</h1>
                    <p className="text-primary font-black text-[10px] lg:text-xs uppercase tracking-[0.3em] opacity-80">Tecnologia Logística Digital</p>
                </div>

                {/* Card de Login */}
                <div className="w-full bg-[#1a2c35] p-6 lg:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden backdrop-blur-sm">
                    {/* Glassmorphism accent */}
                    <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>

                    {!showForgot ? (
                        <>
                            <div className="text-center mb-8 relative z-10">
                                <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Acesso Restrito</h2>
                                <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ID da Empresa / Estabelecimento</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">domain</span>
                                        <input
                                            type="text"
                                            value={tenantId}
                                            onChange={(e) => setTenantId(e.target.value)}
                                            placeholder="ex: t1, empresa_abc"
                                            className="w-full bg-[#0b141a] border border-white/5 focus:border-primary/50 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold placeholder:text-slate-700 uppercase"
                                            required
                                        />
                                    </div>
                                </div>

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
                                    className="w-full bg-primary hover:bg-primary/95 text-white py-4 lg:py-5 rounded-[1.5rem] font-black text-base lg:text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
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

                <div className="mt-12 flex flex-col items-center gap-6">
                    <button
                        onClick={() => {
                            const masterPass = prompt('Digite a Chave de Mestre do Criador:');
                            if (masterPass === 'antigravity-master-2026') {
                                onLogin({ login: 'creator', pass: masterPass, type: 'creator' });
                            } else if (masterPass) {
                                alert('Chave Inválida');
                            }
                        }}
                        className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-primary transition-colors">lock_person</span>
                        <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-[0.2em] transition-colors">
                            Painel do Criador
                        </span>
                    </button>

                    <div className="flex flex-col items-center gap-1 opacity-20">
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">
                            LOGÍSTICA EXPRESS • SOFTWARE AS A SERVICE
                        </p>
                        <p className="text-slate-500 text-[7px] font-bold uppercase tracking-[0.3em]">
                            VERSÃO 2.12.0 PLATINUM
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
