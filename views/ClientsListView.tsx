
import React, { useState } from 'react';
import { Customer, Order } from '../types';

interface ClientsListViewProps {
    customers: Customer[];
    orders: Order[];
}

const ClientsListView: React.FC<ClientsListViewProps> = ({ customers, orders }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const getCustomerStats = (customerName: string) => {
        const customerOrders = orders.filter(o => o.customerName === customerName);
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
        return {
            count: customerOrders.length,
            total: totalSpent,
            lastOrder: customerOrders[0]?.timestamp || 'N/A'
        };
    };

    const openWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}`, '_blank');
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-8">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Gestão de Clientes</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                        {customers.length} Clientes na Base
                    </p>
                </div>
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white dark:bg-[#1a2c35] border border-slate-100 dark:border-white/5 rounded-2xl w-80 outline-none focus:border-primary shadow-sm font-bold text-sm text-slate-900 dark:text-white transition-all"
                    />
                </div>
            </header>

            {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a2c35] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
                        <span className="material-symbols-outlined text-4xl">group_off</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Nenhum cliente registrado</h2>
                    <p className="text-slate-500 font-medium max-w-sm text-center">Os clientes serão adicionados automaticamente ao realizar novos pedidos através do Dashboard.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCustomers.map(customer => {
                        const stats = getCustomerStats(customer.name);
                        return (
                            <div key={customer.id} className="bg-white dark:bg-[#1a2c35] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-2xl transition-all group">
                                <div className="flex items-center gap-4 mb-6">
                                    <img src={customer.avatar} className="size-16 rounded-[1.5rem] object-cover" alt={customer.name} />
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-black text-slate-900 dark:text-white truncate">{customer.name}</h3>
                                        <p className="text-[11px] font-bold text-primary">{customer.phone}</p>
                                    </div>
                                    <button
                                        onClick={() => openWhatsApp(customer.phone)}
                                        className="size-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center hover:bg-green-500 hover:text-white shadow-sm transition-all shadow-green-500/10"
                                    >
                                        <span className="material-symbols-outlined icon-fill">chat</span>
                                    </button>
                                </div>

                                <div className="bg-slate-50 dark:bg-[#101c22] rounded-2xl p-4 mb-6 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">home_pin</span>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">{customer.address}, {customer.neighborhood}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-sm">location_city</span>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{customer.city}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-primary/5 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-1">Total Pedidos</p>
                                        <p className="text-lg font-black text-primary">{stats.count}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gasto Total</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">R$ {stats.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClientsListView;
