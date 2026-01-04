import React, { useState } from 'react';
import { Order, Product } from '../types';

interface FinancialViewProps {
    orders: Order[];
    products: Product[];
}

const FinancialView: React.FC<FinancialViewProps> = ({ orders, products }) => {
    const deliveredOrders = orders.filter(o => o.status === 'Entregue');

    const calculateProfit = (order: Order) => {
        return order.items.reduce((acc, item) => {
            const product = products.find(p => p.name === item.name);
            if (product) {
                const itemCost = product.costPrice * item.quantity;
                return acc + (item.price * item.quantity - itemCost);
            }
            return acc;
        }, 0);
    };

    const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.total, 0);
    const totalProfit = deliveredOrders.reduce((acc, o) => acc + calculateProfit(o), 0);
    const averageTicket = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">payments</span>
                        Fluxo Financeiro
                    </h2>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Análise de rentabilidade e faturamento</p>
                </div>
                <button className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                    Exportar Relatório (PDF)
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden relative group">
                    <div className="size-16 bg-primary/10 rounded-full absolute -right-4 -top-4 group-hover:scale-150 transition-transform"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento Total</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden relative group">
                    <div className="size-16 bg-emerald-500/10 rounded-full absolute -right-4 -top-4 group-hover:scale-150 transition-transform"></div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Lucro Líquido</p>
                    <h3 className="text-3xl font-black text-emerald-600 tracking-tight">R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden relative group">
                    <div className="size-16 bg-amber-500/10 rounded-full absolute -right-4 -top-4 group-hover:scale-150 transition-transform"></div>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Ticket Médio</p>
                    <h3 className="text-3xl font-black text-amber-600 tracking-tight">R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2c35] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 dark:border-white/5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Últimas Transações Faturadas</h3>
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Forma</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Lucro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveredOrders.slice(0, 10).map(order => (
                            <tr key={order.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-8 py-5">
                                    <span className="text-[11px] font-bold text-slate-500">{order.date}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="font-bold text-slate-900 dark:text-white">{order.customerName}</span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase text-slate-500">{order.paymentMethod}</span>
                                </td>
                                <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">
                                    R$ {order.total.toFixed(2)}
                                </td>
                                <td className="px-8 py-5 text-right font-black text-emerald-500">
                                    R$ {calculateProfit(order).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {deliveredOrders.length === 0 && (
                    <div className="p-20 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-4 tracking-tighter">receipt_long</span>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma transação concluída para este período</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialView;
