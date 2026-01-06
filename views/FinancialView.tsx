import React, { useState } from 'react';
import { Order, Product, FinancialTransaction } from '../types';

interface FinancialViewProps {
    orders: Order[];
    products: Product[];
    transactions: FinancialTransaction[];
    onAddTransaction: (t: FinancialTransaction) => void;
    onUpdateTransaction: (t: FinancialTransaction) => void;
}

const FinancialView: React.FC<FinancialViewProps> = ({ orders, products, transactions, onAddTransaction, onUpdateTransaction }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'abc'>('overview');
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [newTransaction, setNewTransaction] = useState<Partial<FinancialTransaction>>({
        type: 'Despesa',
        category: 'Operacional',
        status: 'Pendente',
        date: new Date().toISOString().split('T')[0]
    });

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

    // Estatísticas de CP/CR
    const totalPayable = transactions.filter(t => t.type === 'Despesa' && t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
    const totalReceivable = transactions.filter(t => t.type === 'Receita' && t.status === 'Pendente').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalRevenue + totalReceivable - totalPayable;

    // Curva ABC
    const abcData = products.map(p => {
        const productOrders = deliveredOrders.filter(o => o.items.some(i => i.name === p.name));
        const totalSales = productOrders.reduce((acc, o) => {
            const item = o.items.find(i => i.name === p.name);
            return acc + (item ? item.quantity * item.price : 0);
        }, 0);
        return { name: p.name, totalSales };
    }).sort((a, b) => b.totalSales - a.totalSales);

    const totalAllSales = abcData.reduce((acc, item) => acc + item.totalSales, 0);
    let cumulativeValue = 0;
    const abcWithClass = abcData.map(item => {
        cumulativeValue += item.totalSales;
        const percent = totalAllSales > 0 ? (cumulativeValue / totalAllSales) * 100 : 0;
        let classification = 'C';
        if (percent <= 70) classification = 'A';
        else if (percent <= 90) classification = 'B';
        return { ...item, percent, classification };
    });

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">payments</span>
                        Gestão Financeira
                    </h2>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Painel consolidado ControlGás</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowTransactionModal(true)}
                        className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        Lançar Título
                    </button>
                </div>
            </header>

            {/* Abas */}
            <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl w-fit">
                {[
                    { id: 'overview', label: 'Visão Geral', icon: 'analytics' },
                    { id: 'ledger', label: 'Contas Pagar/Receber', icon: 'account_balance_wallet' },
                    { id: 'abc', label: 'Curva ABC', icon: 'leaderboard' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-[#1a2c35] text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard label="Receita Realizada" value={totalRevenue} color="primary" />
                        <StatCard label="Lucro Líquido" value={totalProfit} color="emerald" />
                        <StatCard label="Contas a Receber" value={totalReceivable} color="blue" />
                        <StatCard label="Contas a Pagar" value={totalPayable} color="red" />
                    </div>

                    <div className="bg-white dark:bg-[#1a2c35] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Fluxo de Caixa Consolidado</h3>
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Saldo Projetado: R$ {balance.toFixed(2)}
                            </span>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...deliveredOrders.map(o => ({
                                    id: o.id,
                                    date: o.date,
                                    type: 'Receita',
                                    description: `Pedido ${o.id.substring(0, 8)} - ${o.customerName}`,
                                    amount: o.total,
                                    status: 'Pago' as const
                                })), ...transactions.map(t => ({
                                    id: t.id,
                                    date: t.date,
                                    type: t.type,
                                    description: t.description,
                                    amount: t.amount,
                                    status: t.status
                                }))]
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 10)
                                    .map(item => (
                                        <tr key={item.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                                            <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{item.date}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${item.type === 'Receita' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{item.description}</td>
                                            <td className={`px-8 py-5 text-right font-black ${item.type === 'Receita' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {item.type === 'Receita' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.status === 'Pago' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'abc' && (
                <div className="bg-white dark:bg-[#1a2c35] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 dark:border-white/5">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Análise Curva ABC (Produtos)
                        </h3>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Classe</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Vendas Acumuladas</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">% Acumulada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {abcWithClass.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-50 dark:border-white/5">
                                    <td className="px-8 py-5 text-center">
                                        <span className={`size-8 rounded-lg flex items-center justify-center font-black mx-auto ${item.classification === 'A' ? 'bg-emerald-100 text-emerald-600' :
                                                item.classification === 'B' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-slate-100 text-slate-500'
                                            }`}>
                                            {item.classification}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-black text-slate-900 dark:text-white">{item.name}</td>
                                    <td className="px-8 py-5 text-right font-black">R$ {item.totalSales.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-bold text-[10px] text-slate-500">{item.percent.toFixed(1)}%</span>
                                            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${item.percent}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Transação */}
            {showTransactionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1a2c35] w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Lançar Novo Título</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Lançamento</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setNewTransaction({ ...newTransaction, type: 'Receita' })}
                                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${newTransaction.type === 'Receita' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}
                                    >Receita</button>
                                    <button
                                        onClick={() => setNewTransaction({ ...newTransaction, type: 'Despesa' })}
                                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${newTransaction.type === 'Despesa' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}
                                    >Despesa</button>
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="Descrição"
                                className="w-full bg-slate-100 dark:bg-white/5 border-none p-4 rounded-2xl font-bold"
                                value={newTransaction.description}
                                onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Valor (R$)"
                                    className="w-full bg-slate-100 dark:bg-white/5 border-none p-4 rounded-2xl font-bold"
                                    value={newTransaction.amount}
                                    onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                                />
                                <input
                                    type="date"
                                    className="w-full bg-slate-100 dark:bg-white/5 border-none p-4 rounded-2xl font-bold"
                                    value={newTransaction.date}
                                    onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowTransactionModal(false)} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/5 rounded-2xl">Cancelar</button>
                            <button
                                onClick={() => {
                                    onAddTransaction({
                                        id: Math.random().toString(36).substr(2, 9),
                                        tenantId: '',
                                        type: newTransaction.type as any,
                                        description: newTransaction.description as string,
                                        amount: newTransaction.amount as number,
                                        date: newTransaction.date as string,
                                        status: 'Pendente',
                                        category: 'Geral'
                                    });
                                    setShowTransactionModal(false);
                                }}
                                className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-white bg-primary rounded-2xl shadow-lg shadow-primary/20"
                            >Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
    <div className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden relative group">
        <div className={`size-16 bg-${color}-500/10 rounded-full absolute -right-4 -top-4 group-hover:scale-150 transition-transform`}></div>
        <p className={`text-[10px] font-black text-${color}-500 uppercase tracking-widest mb-2`}>{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
    </div>
);

export default FinancialView;
