
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthViewProps {
    onLoginSuccess: (session: any) => void;
    globalLogo: string | null;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, globalLogo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;
            if (data.session) {
                onLoginSuccess(data.session);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0b141a] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    {globalLogo ? (
                        <img src={globalLogo} alt="Logo" className="h-20 mx-auto mb-6 object-contain" />
                    ) : (
                        <div className="size-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
                            <span className="material-symbols-outlined text-primary text-5xl">water_drop</span>
                        </div>
                    )}
                    <h1 className="text-3xl font-black text-white tracking-tight">Gás & Água Express</h1>
                    <p className="text-primary font-bold text-xs uppercase tracking-[0.3em] mt-2 opacity-60">SaaS Intelligence</p>
                </div>

                <div className="bg-[#1a2c35] p-8 lg:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none"></div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">E-mail de Acesso</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0b141a] border border-white/5 focus:border-primary/50 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold placeholder:text-slate-700"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0b141a] border border-white/5 focus:border-primary/50 text-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold placeholder:text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary hover:bg-primary/95 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    ENTRAR NO SISTEMA
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] opacity-40">
                    Tecnologia Logística Digital • v2.12
                </p>
            </div>
        </div>
    );
};

export default AuthView;
