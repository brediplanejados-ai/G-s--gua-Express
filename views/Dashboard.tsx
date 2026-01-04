
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Customer, OrderItem, Product } from '../types';

interface DashboardProps {
  orders: Order[];
  customers: Customer[];
  onSelectOrder: (id: string) => void;
  onAddOrder: (order: Order) => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
}

const DashboardView: React.FC<DashboardProps> = ({ orders, customers, onSelectOrder, onAddOrder, products, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientResults, setShowClientResults] = useState(false);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Manual Order Form State
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Pix' | 'Cartão' | 'Carteira'>('Pix');
  const [deliveryType, setDeliveryType] = useState<'Entrega' | 'Retirada'>('Entrega');
  const [notes, setNotes] = useState('');
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'hoje' | 'semanal' | 'mensal' | 'anual'>('hoje');
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split('T')[0]);

  // Wallet specific
  const [interestRate, setInterestRate] = useState<number>(0);
  const [paymentTerm, setPaymentTerm] = useState<15 | 30>(15);

  // Product register
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    id: '', name: '', price: 0, category: 'Gás', icon: 'inventory_2'
  });

  // Cálculo dinâmico do total para o modal
  const currentTotal = newOrderItems.length > 0
    ? newOrderItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
    : 120; // Default P13 total se nada selecionado

  const handleAddItem = (name: string, price: number) => {
    const existing = newOrderItems.find(i => i.name === name);
    if (existing) {
      setNewOrderItems(newOrderItems.map(i => i.name === name ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setNewOrderItems([...newOrderItems, { name, quantity: 1, price }]);
    }
  };

  // Filtro de ordens por período
  const ordersByPeriod = orders.filter(order => {
    const orderDate = new Date(order.date || new Date().toISOString());
    const refDate = new Date(referenceDate);

    if (selectedPeriod === 'hoje') {
      return orderDate.toDateString() === refDate.toDateString();
    }
    if (selectedPeriod === 'semanal') {
      const oneWeekAgo = new Date(refDate);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return orderDate >= oneWeekAgo && orderDate <= refDate;
    }
    if (selectedPeriod === 'mensal') {
      return orderDate.getMonth() === refDate.getMonth() && orderDate.getFullYear() === refDate.getFullYear();
    }
    if (selectedPeriod === 'anual') {
      return orderDate.getFullYear() === refDate.getFullYear();
    }
    return true;
  });

  const filteredOrders = ordersByPeriod.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchedCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch)
  );

  const handleCreateOrder = (customer: Customer | null) => {
    const defaultItems: OrderItem[] = [{ name: 'P13', quantity: 1, price: 120 }];
    const total = defaultItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrder: Order = {
      id: `#${Math.floor(Math.random() * 9000) + 1000}`,
      customerName: customer ? customer.name : manualCustomerName || 'Novo Cliente',
      phone: customer ? customer.phone : manualPhone || '(00) 00000-0000',
      address: customer ? customer.address : manualAddress || '',
      neighborhood: customer ? customer.neighborhood : '',
      city: customer ? customer.city : '',
      avatar: customer ? customer.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(manualCustomerName || 'NC')}&background=random`,
      items: newOrderItems.length > 0 ? newOrderItems : defaultItems,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      status: OrderStatus.PENDING,
      waitTime: '0 min',
      paymentMethod,
      deliveryType,
      notes,
      total: newOrderItems.length > 0 ? newOrderItems.reduce((acc, i) => acc + i.price * i.quantity, 0) : total
    };

    onAddOrder(newOrder);
    setShowManualOrderModal(false);
    setNewOrderItems([]);
    setClientSearch('');
    setSelectedCustomer(null);
    setManualCustomerName('');
    setManualPhone('');
    setManualAddress('');
    setNotes('');
  };

  const getStatusBadge = (status: OrderStatus) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold";
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <span className={`${baseClasses} bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400`}>
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pendente
          </span>
        );
      case OrderStatus.ACCEPTED:
        return (
          <span className={`${baseClasses} bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300`}>
            <span className="size-1.5 rounded-full bg-blue-500"></span>
            Recebido
          </span>
        );
      case OrderStatus.ON_ROUTE:
        return (
          <span className={`${baseClasses} bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300`}>
            <span className="size-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
            Em Rota
          </span>
        );
      case OrderStatus.ARRIVED:
        return (
          <span className={`${baseClasses} bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300`}>
            <span className="size-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            No Local
          </span>
        );
      case OrderStatus.DELIVERED:
        return (
          <span className={`${baseClasses} bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400`}>
            <span className="size-1.5 rounded-full bg-green-500"></span>
            Entregue
          </span>
        );
      case OrderStatus.CLIENT_ABSENT:
        return (
          <span className={`${baseClasses} bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400`}>
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Cliente Ausente
          </span>
        );
      case OrderStatus.CANCELLED:
        return (
          <span className={`${baseClasses} bg-slate-100 dark:bg-slate-800 text-slate-500`}>
            <span className="size-1.5 rounded-full bg-slate-400"></span>
            Cancelado
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-slate-100 text-slate-700`}>{status}</span>;
    }
  };

  // Cálculo de Lucro
  const totalRevenue = ordersByPeriod.reduce((acc, o) => acc + o.total, 0);
  const totalProfit = ordersByPeriod.reduce((acc, o) => {
    const orderProfit = o.items.reduce((itemAcc, item) => {
      const product = products.find(p => p.name === item.name);
      const cost = product ? product.costPrice : 0;
      return itemAcc + (item.price - cost) * item.quantity;
    }, 0);
    return acc + orderProfit;
  }, 0);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Floating Customer Search Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 z-50">
        <div className="relative group">
          <div className="flex items-center bg-white dark:bg-[#1a2c35] rounded-2xl shadow-2xl border-2 border-primary/20 group-focus-within:border-primary transition-all p-2">
            <span className="material-symbols-outlined text-primary ml-3">person_search</span>
            <input
              type="text"
              placeholder="Localizar Cliente Cadastrado (Nome ou Telefone)..."
              className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-slate-900 dark:text-white font-bold"
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setShowClientResults(true);
              }}
              onFocus={() => setShowClientResults(true)}
            />
            {clientSearch && (
              <button onClick={() => setClientSearch('')} className="p-2 text-slate-400 hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {showClientResults && clientSearch.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1a2c35] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-80 overflow-y-auto z-[60]">
              {searchedCustomers.length > 0 ? (
                searchedCustomers.map(customer => (
                  <button
                    key={customer.id}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-0"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowManualOrderModal(true);
                      setShowClientResults(false);
                    }}
                  >
                    <img src={customer.avatar} className="size-10 rounded-full" alt="" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.phone} - {customer.address}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">person_off</span>
                  <p className="text-slate-500 font-medium">Nenhum cliente cadastrado encontrado</p>
                  <button
                    onClick={() => {
                      setShowManualOrderModal(true);
                      setShowClientResults(false);
                    }}
                    className="mt-3 text-primary font-bold text-sm underline"
                  >
                    Usar Novo Pedido Manual
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <header className="flex flex-col gap-4 px-8 py-6 bg-white dark:bg-[#1a2c35] border-b border-[#dbe2e6] dark:border-slate-700 shrink-0 z-10 mt-16">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-slate-900 dark:text-white text-3xl font-extrabold leading-tight tracking-tight uppercase">Dashboard Administrativo</h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                PRONTO PARA PEDIDOS REAIS
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm font-black">support_agent</span>
              Central de Atendimento: <span className="text-primary font-black">(11) 98765-4321</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-[#dbe2e6] dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-[20px]">file_download</span>
              <span>Exportar</span>
            </button>
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setShowManualOrderModal(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm shadow-primary/30 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Novo Pedido Manual</span>
            </button>
          </div>
        </div>

        {/* Period Selector & Stats Row */}
        <div className="flex flex-col gap-6 mt-4">
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl w-fit border border-slate-100 dark:border-slate-700">
            {[
              { id: 'hoje', label: 'Diário' },
              { id: 'semanal', label: 'Semanal' },
              { id: 'mensal', label: 'Mensal' },
              { id: 'anual', label: 'Anual' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedPeriod === p.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
              >
                {p.label}
              </button>
            ))}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-2 px-3">
              <span className="material-symbols-outlined text-sm text-slate-400">calendar_month</span>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 dark:text-slate-300 w-28 uppercase"
              />
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="flex flex-wrap gap-3 animate-in slide-in-from-top-4 duration-500">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl">
                  <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                  <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                    Estoque Baixo: {p.name} ({p.stock} un)
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={`Total ${selectedPeriod}`} value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} change={`Lucro: ${totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} type="positive" icon="payments" />
            <StatCard title="Pendentes" value={ordersByPeriod.filter(o => o.status === OrderStatus.PENDING).length.toString()} icon="schedule" type="warning" />
            <StatCard title="Em Entrega" value={ordersByPeriod.filter(o => o.status === OrderStatus.ON_ROUTE || o.status === OrderStatus.ARRIVED || o.status === OrderStatus.ACCEPTED).length.toString()} icon="motorcycle" type="primary" />
            <StatCard title="Concluídos" value={ordersByPeriod.filter(o => o.status === OrderStatus.DELIVERED).length.toString()} icon="verified" type="success" />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-[#1a2c35] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Balanço de Vendas ({selectedPeriod})</h3>
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <div className="flex flex-col gap-3 px-2">
              {(() => {
                const periods = selectedPeriod === 'hoje' ? 24 : selectedPeriod === 'semanal' ? 7 : selectedPeriod === 'mensal' ? 30 : 12;
                const data = Array(periods).fill(null).map(() => ({
                  Pix: 0,
                  Cartão: 0,
                  Dinheiro: 0,
                  Carteira: 0,
                  total: 0
                }));

                ordersByPeriod.forEach(o => {
                  const date = new Date(o.date || new Date().toISOString());
                  let idx = 0;
                  if (selectedPeriod === 'hoje') idx = date.getHours();
                  else if (selectedPeriod === 'semanal') idx = date.getDay();
                  else if (selectedPeriod === 'mensal') idx = date.getDate() - 1;
                  else idx = date.getMonth();

                  if (idx >= 0 && idx < periods) {
                    const method = o.paymentMethod as keyof typeof data[0];
                    if (data[idx][method] !== undefined) {
                      data[idx][method] += o.total;
                      data[idx].total += o.total;
                    }
                  }
                });

                const max = Math.max(...data.map(d => d.total), 1);

                // Para barra horizontal, vamos mostrar os dados que tem valor ou os últimos 10
                let displayData = data.map((d, i) => ({ ...d, label: i }));
                if (selectedPeriod === 'hoje') {
                  // Mostrar apenas horas com vendas ou as últimas 6
                  displayData = displayData.filter(d => d.total > 0).slice(-6);
                  if (displayData.length === 0) displayData = data.slice(new Date().getHours() - 3, new Date().getHours() + 1).map((d, i) => ({ ...d, label: i }));
                } else if (selectedPeriod === 'semanal') {
                  displayData = displayData.slice(0, 7);
                } else {
                  displayData = displayData.filter(d => d.total > 0).slice(-7);
                }

                return displayData.map((val, i) => {
                  const label = selectedPeriod === 'semanal'
                    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][val.label as number]
                    : selectedPeriod === 'hoje' ? `${val.label}h` : `Dia ${val.label + 1}`;

                  return (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className="w-12 text-[10px] font-black text-slate-400 uppercase tracking-tighter shrink-0">{label}</div>
                      <div className="flex-1 h-6 bg-slate-50 dark:bg-slate-900/50 rounded-full overflow-hidden flex relative">
                        <div className="flex h-full transition-all duration-1000 ease-out" style={{ width: `${(val.total / max) * 100}%` }}>
                          <div className="bg-primary h-full transition-all" style={{ width: `${(val.Pix / val.total || 0) * 100}%` }} title={`Pix: R$ ${val.Pix}`}></div>
                          <div className="bg-cyan-500 h-full transition-all" style={{ width: `${(val.Cartão / val.total || 0) * 100}%` }} title={`Cartão: R$ ${val.Cartão}`}></div>
                          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(val.Dinheiro / val.total || 0) * 100}%` }} title={`Dinheiro: R$ ${val.Dinheiro}`}></div>
                          <div className="bg-amber-500 h-full transition-all" style={{ width: `${(val.Carteira / val.total || 0) * 100}%` }} title={`Carteira: R$ ${val.Carteira}`}></div>
                        </div>
                      </div>
                      <div className="w-20 text-right text-[10px] font-black text-slate-900 dark:text-white shrink-0">
                        R$ {val.total.toFixed(0)}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a2c35] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Métodos de Pagamento</h3>
              <span className="material-symbols-outlined text-primary">pie_chart</span>
            </div>
            {(() => {
              const counts = ordersByPeriod.reduce((acc, o) => {
                acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              const total = ordersByPeriod.length || 1;
              const methods = [
                { name: 'Pix', color: 'bg-primary' },
                { name: 'Cartão', color: 'bg-cyan-500' },
                { name: 'Carteira', color: 'bg-amber-500' },
                { name: 'Dinheiro', color: 'bg-emerald-500' }
              ];

              const pixPct = Math.round(((counts['Pix'] || 0) / total) * 100);
              const cardPct = Math.round(((counts['Cartão'] || 0) / total) * 100);
              const walletPct = Math.round(((counts['Carteira'] || 0) / total) * 100);
              const cashPct = Math.round(((counts['Dinheiro'] || 0) / total) * 100);

              return (
                <div className="flex items-center gap-8 h-48">
                  <div className="size-40 rounded-full border-[16px] border-primary/10 relative"
                    style={{ borderTopColor: 'var(--primary-color)', borderRightColor: '#06b6d4' }}>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xl font-black text-slate-900 dark:text-white">{pixPct + cardPct + walletPct}%</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Digital</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    {methods.map(m => (
                      <div key={m.name} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500 flex items-center gap-2">
                          <div className={`size-2 rounded-full ${m.color}`}></div>
                          {m.name}
                        </span>
                        <span className="font-black text-slate-900 dark:text-white">
                          {Math.round(((counts[m.name] || 0) / total) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-white dark:bg-[#1a2c35] p-4 rounded-xl border border-[#dbe2e6] dark:border-slate-700 shadow-sm">
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
              <input
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium"
                placeholder="Buscar por nome, telefone ou endereço..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1a2c35] rounded-xl border border-[#dbe2e6] dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cliente</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Endereço</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Items</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pagamento</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => onSelectOrder(order.id)}>
                      <td className="p-4 align-middle">
                        <span className="font-mono text-xs font-bold text-slate-500">{order.id}</span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <img src={order.avatar} className="size-8 rounded-full object-cover" alt="" />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{order.customerName}</span>
                            <span className="text-xs text-slate-500">{order.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-sm text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                        {order.address}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-sm font-medium">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${order.paymentMethod === 'Pix' ? 'bg-cyan-50 text-cyan-700' :
                          order.paymentMethod === 'Cartão' ? 'bg-purple-50 text-purple-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right text-sm font-black text-slate-900 dark:text-white">
                        R$ {order.total.toFixed(2)}
                      </td>
                      <td className="p-4 align-middle text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Order Modal */}
      {showManualOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2c35] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Novo Pedido Manual</h2>
                <p className="text-sm text-slate-500">
                  {selectedCustomer ? `Para: ${selectedCustomer.name}` : 'Preencha os dados do cliente'}
                </p>
              </div>
              <button onClick={() => setShowManualOrderModal(false)} className="size-8 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!selectedCustomer && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Cliente</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-bold"
                      placeholder="Nome Completo"
                      value={manualCustomerName}
                      onChange={(e) => setManualCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone (WhatsApp)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-bold"
                      placeholder="(11) 99999-9999"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-[#101c22] outline-none focus:border-primary transition-all font-bold"
                      placeholder="Rua, Número"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Itens do Pedido ({newOrderItems.length})</label>
                <div className="grid grid-cols-3 gap-3">
                  {products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAddItem(p.name, p.price)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${p.category === 'Gás' ? 'border-primary/20 bg-primary/5 text-primary' : 'border-cyan-200 bg-cyan-50 text-cyan-600'} hover:scale-[1.05]`}
                    >
                      <span className="material-symbols-outlined">{p.icon}</span>
                      <span className="text-sm font-black whitespace-nowrap">{p.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowProductModal(true)}
                    className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 border-dashed flex flex-col items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-400">add</span>
                    <span className="text-sm text-slate-500 font-bold">Adicionar</span>
                  </button>
                </div>
                {newOrderItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {newOrderItems.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.quantity}x {item.name} - R${(item.price * item.quantity).toFixed(0)}
                      </span>
                    ))}
                    <button onClick={() => setNewOrderItems([])} className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest pl-2">Limpar</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Método de Pagamento</label>
                  <div className="flex flex-col gap-2">
                    {['Pix', 'Dinheiro', 'Cartão', 'Carteira'].map(m => (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-between ${paymentMethod === m ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-600'}`}
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
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Entrega</label>
                  <div className="flex flex-col gap-2">
                    {['Entrega', 'Retirada'].map(t => (
                      <button
                        key={t}
                        onClick={() => setDeliveryType(t as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-between ${deliveryType === t ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-600'}`}
                      >
                        {t}
                        {deliveryType === t && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observações</label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-[#101c22] resize-none"
                  rows={3}
                  placeholder="Troco para 100, campainha estragada, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500">Valor Total do Pedido</span>
                <span className="text-2xl font-black text-primary">
                  R$ {(currentTotal * (1 + (interestRate / 100))).toFixed(2)}
                  {interestRate > 0 && <span className="text-[10px] text-primary/60 ml-1">(+{interestRate}% juros)</span>}
                </span>
              </div>
              <button
                onClick={() => handleCreateOrder(selectedCustomer)}
                className="px-8 py-3 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Product Registration Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a2c35] w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-white/5 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Novo Produto</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Produto</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                  placeholder="Ex: P13, Água 20L..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preço de Venda</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="Gás">Gás</option>
                    <option value="Água">Água</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-4 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onAddProduct({ ...newProduct, id: 'p' + Date.now() });
                    setShowProductModal(false);
                    setNewProduct({ id: '', name: '', price: 0, category: 'Gás', icon: 'inventory_2' });
                  }}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const StatCard: React.FC<{ title: string; value: string; change?: string; icon?: string; type: string }> = ({ title, value, change, icon, type }) => {
  const types: Record<string, string> = {
    positive: "bg-background-light dark:bg-slate-800/50",
    warning: "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10",
    primary: "bg-background-light dark:bg-slate-800/50",
    success: "bg-background-light dark:bg-slate-800/50"
  };

  return (
    <div className={`flex flex-col gap-1 rounded-xl p-5 border border-[#dbe2e6] dark:border-slate-700 ${types[type]}`}>
      <div className="flex justify-between items-start">
        <p className={`${type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'} text-sm font-medium`}>{title}</p>
        {change && (
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">{change}</span>
        )}
        {icon && (
          <span className={`material-symbols-outlined ${type === 'warning' ? 'text-amber-500 icon-fill' : type === 'primary' ? 'text-primary' : 'text-green-600 icon-fill'}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-slate-900 dark:text-white text-2xl font-black">{value}</p>
    </div>
  );
};

export default DashboardView;

