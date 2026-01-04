import React from 'react';

interface PlaceholderViewProps {
    title: string;
    icon: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon }) => {
    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0b141a] p-8 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto w-full">
                <header className="flex flex-col gap-1 mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
                            <span className="material-symbols-outlined text-3xl icon-fill">{icon}</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
                    </div>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest ml-[60px]">Em fase final de homologação • Acesso Antecipado</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-[#1a2c35] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
                            <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4"></div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-2"></div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white dark:bg-[#1a2c35] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center text-center shadow-xl">
                    <div className="size-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 relative">
                        <span className="material-symbols-outlined text-5xl text-primary animate-bounce">{icon}</span>
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white shadow-lg">PRO</div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Estamos polindo os detalhes!</h3>
                    <p className="text-slate-500 max-w-md font-medium leading-relaxed mb-8">
                        A funcionalidade de <strong>{title}</strong> está sendo integrada à nossa base de dados logística para garantir precisão absoluta.
                    </p>
                    <div className="flex gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="size-10 rounded-full border-4 border-white dark:border-[#1a2c35] shadow-lg" />)}
                        </div>
                        <div className="text-left font-bold text-xs text-slate-400">
                            <span className="text-slate-900 dark:text-white block font-black">Homologado por</span>
                            4 grandes distribuidoras
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderView;
