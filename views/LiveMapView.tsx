import React, { useState } from 'react';
import { Driver, Order } from '../types';

interface LiveMapViewProps {
    drivers: Driver[];
    orders: Order[];
}

const LiveMapView: React.FC<LiveMapViewProps> = ({ drivers, orders }) => {
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

    // Localização base: São Paulo (Centro)
    const baseLat = -23.5505;
    const baseLng = -46.6333;

    const selectedDriverData = drivers.find(d => d.id === selectedDriver);
    const mapLat = selectedDriverData?.lat || baseLat;
    const mapLng = selectedDriverData?.lng || baseLng;

    // Simulação de drivers ativos
    const activeDrivers = drivers.filter(d => d.status === 'online' || d.status === 'delivering');

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0b141a] overflow-hidden">
            {/* Header Responsivo */}
            <header className="bg-white dark:bg-[#1a2c35] border-b border-slate-200 dark:border-slate-800 p-4 lg:p-6 z-10 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 lg:size-12 bg-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined text-2xl lg:text-3xl icon-fill">map</span>
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mapa em Tempo Real</h2>
                            <p className="text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest">Monitoramento Logístico Ativo</p>
                        </div>
                    </div>

                    <div className="flex gap-2 text-xs">
                        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold flex items-center gap-2 border border-emerald-500/20">
                            <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            {activeDrivers.length} Entregadores Online
                        </div>
                        <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-bold flex items-center gap-2 border border-amber-500/20">
                            <span className="size-2 bg-amber-500 rounded-full"></span>
                            {orders.filter(o => o.status === 'Em Rota').length} Entregas em Curso
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
                {/* Lista Lateral de Entregadores (Mobile: Overlay ou Bottom Sheet, Desktop: Sidebar) */}
                <div className="w-full lg:w-80 bg-white dark:bg-[#1a2c35] border-b lg:border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20 h-48 lg:h-full">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Frota Ativa</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 lg:p-3 space-y-2">
                        {drivers.map(driver => (
                            <button
                                key={driver.id}
                                onClick={() => setSelectedDriver(driver.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left
                                    ${selectedDriver === driver.id
                                        ? 'bg-primary/5 border-primary shadow-sm scale-[1.02]'
                                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <div className="relative">
                                    <img src={driver.avatar} className="size-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
                                    <div className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white dark:border-[#1a2c35]
                                        ${driver.status === 'online' ? 'bg-emerald-500' : driver.status === 'delivering' ? 'bg-amber-500' : 'bg-slate-400'}`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{driver.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        {driver.status === 'delivering' ? '🚗 Em entrega...' : driver.status === 'online' ? '✅ Disponível' : '💤 Offline'}
                                    </p>
                                </div>
                                {driver.status === 'delivering' && (
                                    <span className="material-symbols-outlined text-amber-500 text-lg animate-pulse">local_shipping</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mapa (Foco em São Paulo - Aberto/Opcional para outras cidades) */}
                <div className="flex-1 relative bg-slate-200 dark:bg-slate-900 group">
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: document.documentElement.classList.contains('dark') ? 'invert(90%) hue-rotate(180deg) brightness(0.8)' : 'none' }}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.01},${mapLat - 0.01},${mapLng + 0.01},${mapLat + 0.01}&layer=mapnik&marker=${mapLat},${mapLng}`}
                    ></iframe>

                    <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
                        Map Data © OpenStreetMap contributors
                    </div>

                    {/* Overlay de carregamento / Preview do Motorista Selecionado */}
                    {selectedDriver && (
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-[#1a2c35]/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 max-w-sm animate-in fade-in slide-in-from-top-4 z-30">
                            <div className="flex items-start gap-4">
                                <div className="flex-1">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                                        Rastreando: {selectedDriverData?.name}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                                        📍 {selectedDriverData?.lat?.toFixed(5)}, {selectedDriverData?.lng?.toFixed(5)}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-3 text-emerald-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">speed</span>
                                        Velocidade: {selectedDriverData?.currentSpeed || 0} km/h • SINAL ONLINE
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                                            <span className="material-symbols-outlined text-base">radio</span>
                                            CHAMAR NO RÁDIO
                                        </button>
                                        <button onClick={() => setSelectedDriver(null)} className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-black px-4 py-2 rounded-xl">FECHAR</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveMapView;
