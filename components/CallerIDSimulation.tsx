import React, { useState, useEffect } from 'react';
import { Customer } from '../types';

interface CallerIDSimulationProps {
    customers: Customer[];
    onNewOrder: (customer: Customer) => void;
}

const CallerIDSimulation: React.FC<CallerIDSimulationProps> = ({ customers, onNewOrder }) => {
    const [incomingCall, setIncomingCall] = useState<Customer | null>(null);
    const [showSimulation, setShowSimulation] = useState(false);

    // Simulação de chamada aleatória vindo da base de clientes
    const simulateCall = () => {
        if (customers.length === 0) return;
        const randomIndex = Math.floor(Math.random() * customers.length);
        setIncomingCall(customers[randomIndex]);
        setShowSimulation(true);
    };

    if (!showSimulation || !incomingCall) return (
        <button
            onClick={simulateCall}
            className="fixed bottom-8 right-8 z-50 size-14 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group"
            title="Simular CGBina (Chamada Entrada)"
        >
            <span className="material-symbols-outlined icon-fill">phone_in_talk</span>
            <span className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Simular Bina</span>
        </button>
    );

    return (
        <div className="fixed top-8 right-8 z-[200] w-80 bg-white dark:bg-[#1a2c35] rounded-[2.5rem] shadow-2xl border border-primary/20 p-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-4 mb-6">
                <div className="size-16 bg-primary/10 rounded-3xl flex items-center justify-center relative">
                    <img src={incomingCall.avatar} className="size-full rounded-3xl object-cover" alt="" />
                    <div className="absolute -bottom-1 -right-1 size-6 bg-emerald-500 border-4 border-white dark:border-[#1a2c35] rounded-full animate-pulse"></div>
                </div>
                <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Chamada via CGBina</p>
                    <h3 className="font-black text-slate-900 dark:text-white leading-tight">{incomingCall.name}</h3>
                    <p className="text-xs font-bold text-slate-500">{incomingCall.phone}</p>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Último Pedido</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Fiel</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{incomingCall.address}</p>
                <div className="flex gap-2 mt-3">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[9px] font-black uppercase">Ouro</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[9px] font-black uppercase">{incomingCall.loyaltyPoints} Pts</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setShowSimulation(false)}
                    className="py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                    Recusar
                </button>
                <button
                    onClick={() => {
                        onNewOrder(incomingCall);
                        setShowSimulation(false);
                    }}
                    className="py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                >
                    Atender & Abrir
                </button>
            </div>
        </div>
    );
};

export default CallerIDSimulation;
