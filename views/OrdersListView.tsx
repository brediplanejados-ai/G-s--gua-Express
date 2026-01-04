
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';

interface OrdersListViewProps {
    orders: Order[];
    onSelectOrder: (id: string) => void;
}

const OrdersListView: React.FC<OrdersListViewProps> = ({ orders, onSelectOrder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Todos'>('Todos');

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
            case OrderStatus.ACCEPTED: return 'bg-blue-100 text-blue-700 border-blue-200';
            case OrderStatus.ON_ROUTE: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case OrderStatus.ARRIVED: return 'bg-purple-100 text-purple-700 border-purple-200';
            case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700 border-green-200';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0b141a] overflow-hidden">
            <header className="bg-white dark:bg-[#1a2c35] border-b border-slate-200 dark:border-white/5 p-8 shrink-0">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-tighter">Gerenciamento de Pedidos</h1>
                            <p className="text-slate-500 font-bold text-sm">Visualize e gerencie todas as transações do sistema.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all border border-slate-200/50 dark:border-white/5 uppercase tracking-widest">
                                <span className="material-symbols-outlined text-lg">download</span>
                                Exportar
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por ID, Cliente ou Endereço..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-6 py-4 bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all shadow-sm cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="Todos">Todos os Status</option>
                            {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1400px] mx-auto">
                    <div className="bg-white dark:bg-[#1a2c35] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-50 dark:border-white/5">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data/Hora</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center">
                                                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">order_approve</span>
                                                <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum pedido encontrado</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map(order => (
                                            <tr
                                                key={order.id}
                                                onClick={() => onSelectOrder(order.id)}
                                                className="group hover:bg-slate-50 dark:hover:bg-primary/5 transition-all cursor-pointer"
                                            >
                                                <td className="px-8 py-6">
                                                    <span className="font-mono font-black text-primary">{order.id}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <img src={order.avatar} className="size-10 rounded-xl object-cover" alt="" />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{order.customerName}</span>
                                                            <span className="text-[10px] font-bold text-slate-400">{order.phone}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="max-w-[200px]">
                                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 truncate">{order.address}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">{order.neighborhood}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-sm font-bold text-slate-500">
                                                    {order.date} <span className="opacity-50">|</span> {order.timestamp}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(order.status)} animate-in fade-in duration-500`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">R$ {order.total.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrdersListView;
