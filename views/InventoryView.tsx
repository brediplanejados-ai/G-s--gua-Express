import React, { useState } from 'react';
import { Product } from '../types';

interface InventoryProps {
    products: Product[];
    onUpdateProduct: (product: Product) => void;
    onOpenProductModal: () => void;
}

const InventoryView: React.FC<InventoryProps> = ({ products, onUpdateProduct, onOpenProductModal }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-4xl">inventory_2</span>
                        Controle de Estoque
                    </h2>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Gestão de ativos e reposição em tempo real</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onOpenProductModal}
                        className="flex items-center justify-center gap-2 rounded-2xl h-11 px-6 bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Novo Produto</span>
                    </button>
                    <div className="bg-white dark:bg-[#1a2c35] px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-3 shadow-sm">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar produto..."
                            className="bg-transparent border-none outline-none font-bold text-sm text-slate-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1a2c35] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Cheios (Pronto p/ Venda)</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{products.reduce((acc, p) => acc + p.stock, 0)}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2c35] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Vazios (P/ Reposição)</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{products.reduce((acc, p) => acc + (p.stockEmpty || 0), 0)}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2c35] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Danificados</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{products.reduce((acc, p) => acc + (p.stockDamaged || 0), 0)}</h3>
                </div>
                <div className="bg-white dark:bg-[#1a2c35] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Estoque Crítico</p>
                    <h3 className="text-2xl font-black text-primary">{products.filter(p => p.stock <= p.minStock).length}</h3>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2c35] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 dark:border-white/5">
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cheios</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vazios</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Danificados</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ciclo de Vida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(product => (
                            <tr key={product.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">{product.icon}</span>
                                        </div>
                                        <span className="font-black text-slate-900 dark:text-white">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center font-black text-emerald-600">
                                    {product.stock} un
                                </td>
                                <td className="px-8 py-6 text-center font-black text-amber-600">
                                    {product.stockEmpty || 0} un
                                </td>
                                <td className="px-8 py-6 text-center font-black text-red-600">
                                    {product.stockDamaged || 0} un
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-center">
                                        {product.stock <= product.minStock ? (
                                            <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Crítico</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Normal</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onUpdateProduct({
                                                ...product,
                                                stock: product.stock + 1,
                                                stockEmpty: Math.max(0, (product.stockEmpty || 0) - 1)
                                            })}
                                            title="Repor (Vazio -> Cheio)"
                                            className="size-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                                        </button>
                                        <button
                                            onClick={() => onUpdateProduct({
                                                ...product,
                                                stockEmpty: (product.stockEmpty || 0) + 1,
                                                stock: Math.max(0, product.stock - 1)
                                            })}
                                            title="Marcar como Vazio"
                                            className="size-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-sm">settings_backup_restore</span>
                                        </button>
                                        <button
                                            onClick={() => onUpdateProduct({
                                                ...product,
                                                stockDamaged: (product.stockDamaged || 0) + 1,
                                                stock: Math.max(0, product.stock - 1)
                                            })}
                                            title="Marcar como Danificado"
                                            className="size-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-sm">dangerous</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryView;
