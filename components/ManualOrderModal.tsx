
import React, { useState, useEffect } from 'react';
import { Customer, Order, OrderItem, OrderStatus, Product } from '../types';

interface ManualOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: Customer[];
    products: Product[];
    onAddOrder: (order: Order) => void;
    pixKey?: string;
    initialCustomer?: Customer | null;
}

const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
    isOpen, onClose, customers, products, onAddOrder, pixKey, initialCustomer
}) => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer || null);
    const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Pix' | 'Cartão' | 'Carteira'>('Pix');
    const [deliveryType, setDeliveryType] = useState<'Entrega' | 'Retirada'>('Entrega');
    const [notes, setNotes] = useState('');
    const [manualCustomerName, setManualCustomerName] = useState('');
    const [manualPhone, setManualPhone] = useState('');
    const [manualZipCode, setManualZipCode] = useState('');
    const [manualStreet, setManualStreet] = useState('');
    const [manualNumber, setManualNumber] = useState('');
    const [manualNeighborhood, setManualNeighborhood] = useState('');
    const [manualCity, setManualCity] = useState('');
    const [manualComplement, setManualComplement] = useState('');
    const [interestRate, setInterestRate] = useState<number>(0);
    const [paymentTerm, setPaymentTerm] = useState<15 | 30>(15);

    useEffect(() => {
        if (initialCustomer) {
            setSelectedCustomer(initialCustomer);
        }
    }, [initialCustomer]);

    if (!isOpen) return null;

    const currentTotal = newOrderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const handleAddItem = (name: string, price: number) => {
        const existing = newOrderItems.find(i => i.name === name);
        if (existing) {
            setNewOrderItems(newOrderItems.map(i => i.name === name ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setNewOrderItems([...newOrderItems, { name, quantity: 1, price }]);
        }
    };

    const handleRemoveItem = (name: string) => {
        const existing = newOrderItems.find(i => i.name === name);
        if (existing && existing.quantity > 1) {
            setNewOrderItems(newOrderItems.map(i => i.name === name ? { ...i, quantity: i.quantity - 1 } : i));
        } else {
            setNewOrderItems(newOrderItems.filter(i => i.name !== name));
        }
    };

    const handleCepChange = async (cep: string) => {
        const cleanedCep = cep.replace(/\D/g, '');
        setManualZipCode(cleanedCep);
        if (cleanedCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setManualStreet(data.logradouro);
                    setManualNeighborhood(data.bairro);
                    setManualCity(data.localidade);
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };

    const handleCreateOrder = () => {
        if (newOrderItems.length === 0) {
            alert("Por favor, adicione pelo menos um item ao pedido.");
            return;
        }

        const newOrder: Order = {
            id: `#${Math.floor(Math.random() * 9000) + 1000}`,
            tenantId: 't1',
            customerName: selectedCustomer ? selectedCustomer.name : manualCustomerName || 'Novo Cliente',
            phone: selectedCustomer ? selectedCustomer.phone : manualPhone || '(00) 00000-0000',
            zipCode: selectedCustomer ? selectedCustomer.zipCode : manualZipCode,
            street: selectedCustomer ? selectedCustomer.street : manualStreet,
            number: selectedCustomer ? selectedCustomer.number : manualNumber,
            neighborhood: selectedCustomer ? selectedCustomer.neighborhood : manualNeighborhood,
            city: selectedCustomer ? selectedCustomer.city : manualCity,
            complement: selectedCustomer ? selectedCustomer.complement : manualComplement,
            address: selectedCustomer ? selectedCustomer.address : `${manualStreet}, ${manualNumber}`,
            avatar: selectedCustomer ? selectedCustomer.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(manualCustomerName || 'NC')}&background=random`,
            items: newOrderItems,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toISOString().split('T')[0],
            status: OrderStatus.PENDING,
            waitTime: '0 min',
            paymentMethod,
            deliveryType,
            notes,
            total: currentTotal * (1 + (interestRate / 100))
        };

        onAddOrder(newOrder);
        onClose();
        // Reset state
        setNewOrderItems([]);
        setSelectedCustomer(null);
        setManualCustomerName('');
        setManualPhone('');
        setManualZipCode('');
        setManualStreet('');
        setManualNumber('');
        setManualNeighborhood('');
        setManualCity('');
        setManualComplement('');
        setNotes('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a2c35] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Pedido Manual</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {selectedCustomer ? `Para: ${selectedCustomer.name}` : 'Preencha os dados do cliente'}
                        </p>
                    </div>
                    <button onClick={onClose} className="size-8 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {!selectedCustomer && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome do Cliente</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-black text-sm"
                                    placeholder="Nome Completo"
                                    value={manualCustomerName}
                                    onChange={(e) => setManualCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Telefone (WhatsApp)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-black text-sm"
                                    placeholder="(11) 99999-9999"
                                    value={manualPhone}
                                    onChange={(e) => setManualPhone(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-6 gap-4 col-span-2">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CEP</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-black text-sm"
                                        placeholder="00000-000"
                                        value={manualZipCode}
                                        onChange={(e) => handleCepChange(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rua / Logradouro</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-black text-sm"
                                        placeholder="Nome da Rua"
                                        value={manualStreet}
                                        onChange={(e) => setManualStreet(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Número</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-black text-sm"
                                        placeholder="123"
                                        value={manualNumber}
                                        onChange={(e) => setManualNumber(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bairro</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-black text-sm"
                                        placeholder="Bairro"
                                        value={manualNeighborhood}
                                        onChange={(e) => setManualNeighborhood(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cidade</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-black text-sm"
                                        placeholder="Cidade"
                                        value={manualCity}
                                        onChange={(e) => setManualCity(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Itens do Pedido ({newOrderItems.length})</label>
                        <div className="grid grid-cols-3 gap-3">
                            {products.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleAddItem(p.name, p.price)}
                                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${p.category === 'Gás' ? 'border-primary/20 bg-primary/5 text-primary' : 'border-cyan-200 bg-cyan-50 text-cyan-600'} hover:scale-[1.05]`}
                                >
                                    <span className="material-symbols-outlined">{p.icon}</span>
                                    <span className="text-xs font-black whitespace-nowrap uppercase tracking-tighter">{p.name}</span>
                                    <span className="text-[10px] font-bold opacity-60">R$ {p.price.toFixed(0)}</span>
                                </button>
                            ))}
                        </div>
                        {newOrderItems.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {newOrderItems.map((item, idx) => (
                                    <div key={idx} className="group relative flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
                                        <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-tight">
                                            {item.quantity}x {item.name} - R${(item.price * item.quantity).toFixed(0)}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveItem(item.name)}
                                            className="ml-2 size-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
                                        >
                                            <span className="material-symbols-outlined text-[12px] font-black">remove</span>
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => setNewOrderItems([])} className="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest px-2 self-center">Limpar Tudo</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Forma de Pagamento</label>
                            <div className="flex flex-col gap-2">
                                {['Pix', 'Dinheiro', 'Cartão', 'Carteira'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setPaymentMethod(m as any)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center justify-between ${paymentMethod === m ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'}`}
                                    >
                                        {m}
                                        {paymentMethod === m && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === 'Carteira' && (
                                <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4 animate-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-[10px] font-black text-primary uppercase mb-1.5">Juros Adicional (%)</label>
                                        <input
                                            type="number"
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(Number(e.target.value))}
                                            className="w-full bg-white dark:bg-[#101c22] border-2 border-primary/20 rounded-xl px-4 py-2 text-sm font-black text-primary outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setPaymentTerm(15)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${paymentTerm === 15 ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-[#0b141a] text-slate-400'}`}
                                        >
                                            15 Dias
                                        </button>
                                        <button
                                            onClick={() => setPaymentTerm(30)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${paymentTerm === 30 ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-[#0b141a] text-slate-400'}`}
                                        >
                                            30 Dias
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Entrega</label>
                            <div className="flex flex-col gap-2">
                                {['Entrega', 'Retirada'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setDeliveryType(t as any)}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center justify-between ${deliveryType === t ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'}`}
                                    >
                                        {t}
                                        {deliveryType === t && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                                    </button>
                                ))}
                            </div>
                            {paymentMethod === 'Pix' && pixKey && (
                                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in zoom-in-95 duration-200">
                                    <p className="text-[10px] font-black text-primary uppercase mb-1">Pagar via PIX (Chave):</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white select-all break-all">{pixKey}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observações do Pedido</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-bold text-sm resize-none"
                            rows={3}
                            placeholder="Troco para 100, campainha estragada, referências..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col text-center sm:text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Final</span>
                        <span className="text-3xl font-black text-primary">
                            R$ {(currentTotal * (1 + (interestRate / 100))).toFixed(2)}
                            {interestRate > 0 && <span className="text-xs text-primary/60 ml-2">(+{interestRate}% juros)</span>}
                        </span>
                    </div>
                    <button
                        onClick={handleCreateOrder}
                        className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <span className="material-symbols-outlined">send</span>
                        Confirmar Pedido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualOrderModal;
