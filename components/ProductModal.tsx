
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProduct: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onAddProduct }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [costPrice, setCostPrice] = useState<number>(0);
    const [stock, setStock] = useState<number>(0);
    const [minStock, setMinStock] = useState<number>(5);
    const [category, setCategory] = useState('Gás');
    const [newCategory, setNewCategory] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [icon, setIcon] = useState('inventory_2');
    const [image, setImage] = useState<string | null>(null);

    if (!isOpen) return null;

    const categories = ['Gás', 'Água', 'Acessórios', 'Outros'];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!name || price <= 0) {
            alert('Preencha o nome e o preço do produto.');
            return;
        }

        const finalCategory = showNewCategory ? newCategory : category;

        const newProduct: Product = {
            id: 'p' + Date.now(),
            tenantId: 't1',
            name,
            price,
            costPrice,
            stock,
            minStock,
            category: finalCategory as any,
            icon,
            avatar: image || undefined
        };

        onAddProduct(newProduct);
        onClose();
        // Reset
        setName('');
        setPrice(0);
        setCostPrice(0);
        setStock(0);
        setMinStock(5);
        setCategory('Gás');
        setNewCategory('');
        setShowNewCategory(false);
        setImage(null);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a2c35] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 animate-in zoom-in-95">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Produto</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure os detalhes do item no estoque</p>
                    </div>
                    <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Imagem do Produto */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-32 rounded-[2rem] bg-slate-100 dark:bg-[#101c22] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                            {image ? (
                                <img src={image} className="size-full object-cover" alt="Preview" />
                            ) : (
                                <span className="material-symbols-outlined text-4xl text-slate-300">add_a_photo</span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Clique para subir foto</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Produto</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                                placeholder="Ex: Gás P13, Água 20L..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preço de Venda</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 pl-12 font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custo Unitário</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                                    <input
                                        type="number"
                                        value={costPrice}
                                        onChange={(e) => setCostPrice(Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 pl-12 font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estoque Inicial</label>
                                <input
                                    type="number"
                                    value={stock}
                                    onChange={(e) => setStock(Number(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estoque Mínimo</label>
                                <input
                                    type="number"
                                    value={minStock}
                                    onChange={(e) => setMinStock(Number(e.target.value))}
                                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                            {!showNewCategory ? (
                                <div className="flex gap-2">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="flex-1 bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all appearance-none"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <button
                                        onClick={() => setShowNewCategory(true)}
                                        className="px-4 bg-primary/10 text-primary rounded-2xl font-black text-xs uppercase"
                                    >
                                        + Novo
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="flex-1 bg-slate-50 dark:bg-[#101c22] border-2 border-primary/20 rounded-2xl p-4 font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                                        placeholder="Nome da categoria..."
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setShowNewCategory(false)}
                                        className="px-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase"
                                    >
                                        Voltar
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ícone Visual</label>
                            <div className="grid grid-cols-5 gap-3">
                                {['inventory_2', 'propane_tank', 'water_drop', 'local_gas_station', 'home_repair_service'].map(i => (
                                    <button
                                        key={i}
                                        onClick={() => setIcon(i)}
                                        className={`size-12 rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-slate-100 dark:bg-[#101c22] text-slate-400 hover:text-primary'}`}
                                    >
                                        <span className="material-symbols-outlined">{i}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                    <button
                        onClick={handleSave}
                        className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined">save</span>
                        Salvar Produto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
