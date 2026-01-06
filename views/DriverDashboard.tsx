
import React, { useState, useEffect } from 'react';
import { Order, Driver, OrderStatus } from '../types';

interface DriverDashboardProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  driver: Driver;
  onEndShift: () => void;
  onRefreshData?: () => void;
  isSyncing?: boolean;
}

const DriverDashboardView: React.FC<DriverDashboardProps> = ({ orders, onUpdateOrder, driver, onEndShift, onRefreshData, isSyncing }) => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Som de Notificação
  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Áudio bloqueado pelo navegador até interação.'));
  };

  // Filtrar pedidos atribuídos a este entregador
  useEffect(() => {
    const assigned = orders.find(o =>
      o.driver === driver.name &&
      o.status !== OrderStatus.DELIVERED &&
      o.status !== OrderStatus.CANCELLED
    );

    // Tocar som se for um pedido novo que acabou de chegar
    if (assigned && assigned.id !== lastOrderId) {
      setLastOrderId(assigned.id);
      if (assigned.status === OrderStatus.PENDING) {
        playNotificationSound();
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      }
    }

    setActiveOrder(assigned || null);
  }, [orders, driver.name, lastOrderId]);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = orders.filter(o => o.driver === driver.name && o.status === OrderStatus.DELIVERED && o.date === today);
  const totalSalesToday = completedToday.reduce((acc, o) => acc + o.total, 0);

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    if (activeOrder) {
      onUpdateOrder({ ...activeOrder, status: newStatus });
    }
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 1;
      case OrderStatus.ACCEPTED: return 2;
      case OrderStatus.ON_ROUTE: return 3;
      case OrderStatus.ARRIVED: return 4;
      case OrderStatus.DELIVERED: return 5;
      default: return 1;
    }
  };

  const currentStep = activeOrder ? getStatusStep(activeOrder.status) : 0;

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0b141a] text-white overflow-hidden font-sans">
      {/* HEADER ISOLADO */}
      <header className="p-4 flex items-center justify-between bg-[#1a2c35] border-b border-white/5 shadow-2xl z-30">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <span className="material-symbols-outlined font-black">delivery_dining</span>
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-tight">Painel Entregador</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{driver.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-black/20 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[8px] font-black text-primary uppercase block">Vendas Turno</span>
            <span className="text-xs font-black">R$ {totalSalesToday.toFixed(2)}</span>
          </div>
          <button
            onClick={() => onRefreshData?.()}
            className={`size-10 flex items-center justify-center bg-white/5 rounded-xl active:scale-90 transition-all ${isSyncing ? 'animate-spin text-primary' : 'text-slate-400'}`}
          >
            <span className="material-symbols-outlined text-xl">sync</span>
          </button>
          <button
            onClick={onEndShift}
            className="size-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {!activeOrder ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="size-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-600 animate-pulse">
              <span className="material-symbols-outlined text-6xl">notifications_off</span>
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Nenhum pedido ativo</h3>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Aguardando novos despachos...</p>
            </div>
            <div className="bg-white/5 px-6 py-4 rounded-3xl border border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Resumo do seu Turno</span>
              <div className="flex gap-8">
                <div>
                  <p className="text-[8px] font-bold text-primary uppercase">Entregues</p>
                  <p className="text-xl font-black">{completedToday.length}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase">Total</p>
                  <p className="text-xl font-black">R$ {totalSalesToday.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* COLUNA ESQUERDA: CLIENTE E PAGAMENTO */}
            <div className="space-y-4">
              <div className="bg-[#1a2c35] p-6 rounded-[2rem] border border-white/5 space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Cliente</span>
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl font-black text-white">
                    {activeOrder.customerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-lg leading-tight uppercase italic">{activeOrder.customerName}</h4>
                    <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">Premium</span>
                  </div>
                </div>
                <a
                  href={`https://api.whatsapp.com/send?phone=${activeOrder.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-500">chat</span>
                    <span className="font-bold text-sm">{activeOrder.phone}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-500">open_in_new</span>
                </a>
              </div>

              <div className="bg-[#1a2c35] p-6 rounded-[2rem] border border-white/5 space-y-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Endereço de Entrega</span>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <div>
                    <p className="font-black text-sm">{activeOrder.address}, {activeOrder.number}</p>
                    <p className="text-xs font-bold text-slate-400">{activeOrder.neighborhood}, {activeOrder.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-xl border border-primary/10">
                  <span className="material-symbols-outlined text-primary text-sm">local_shipping</span>
                  <span className="text-[10px] font-black uppercase text-primary">Entrega Padrão</span>
                </div>
              </div>

              <div className="bg-[#1a2c35] p-6 rounded-[2rem] border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Pagamento</span>
                <div className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5 overflow-hidden relative">
                  <div className="flex items-center gap-3 z-10">
                    <span className="material-symbols-outlined text-emerald-500">account_balance_wallet</span>
                    <span className="font-black text-sm uppercase">{activeOrder.paymentMethod}</span>
                  </div>
                  <span className="font-black text-xl z-10">R$ {activeOrder.total.toFixed(2)}</span>
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-emerald-500"></div>
                </div>
                {activeOrder.paymentMethod === 'PIX' && (
                  <p className="text-[9px] font-bold text-slate-500 mt-3 text-center uppercase tracking-widest">Chave: {driver.tenantId || 'seu-pix@empresa.com'}</p>
                )}
              </div>
            </div>

            {/* COLUNA CENTRAL: TIMELINE E CONTROLE */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a2c35] p-6 rounded-[2rem] border border-white/5 h-full flex flex-col">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Acompanhamento em Tempo Real</h3>

                <div className="flex-1 space-y-8 relative">
                  {/* Linha da Vertical da Timeline */}
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/5"></div>

                  {[
                    { id: 1, label: 'Pedido Recebido', status: OrderStatus.PENDING },
                    { id: 2, label: 'Aceito pelo Entregador', status: OrderStatus.ACCEPTED },
                    { id: 3, label: 'Saindo para Entrega', status: OrderStatus.ON_ROUTE },
                    { id: 4, label: 'Chegou no Local', status: OrderStatus.ARRIVED },
                    { id: 5, label: 'Pedido Entregue', status: OrderStatus.DELIVERED }
                  ].map((step) => (
                    <div key={step.id} className="flex items-center justify-between z-10 relative">
                      <div className="flex items-center gap-4">
                        <div className={`size-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${currentStep >= step.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-white/5 text-slate-600'}`}>
                          {currentStep > step.id ? <span className="material-symbols-outlined text-sm">check</span> : step.id}
                        </div>
                        <span className={`font-black text-sm uppercase italic tracking-tighter ${currentStep === step.id ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600">{currentStep >= step.id ? 'OK' : '-'}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-12 space-y-3">
                  {activeOrder.status === OrderStatus.PENDING && (
                    <button
                      onClick={() => handleUpdateStatus(OrderStatus.ACCEPTED)}
                      className="w-full bg-primary py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 active:scale-95 transition-all outline-none"
                    >
                      ACEITAR PEDIDO
                    </button>
                  )}
                  {activeOrder.status === OrderStatus.ACCEPTED && (
                    <button
                      onClick={() => handleUpdateStatus(OrderStatus.ON_ROUTE)}
                      className="w-full bg-[#13a4ec] py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all outline-none"
                    >
                      SAIR PARA ENTREGA
                    </button>
                  )}
                  {activeOrder.status === OrderStatus.ON_ROUTE && (
                    <button
                      onClick={() => handleUpdateStatus(OrderStatus.ARRIVED)}
                      className="w-full bg-[#ff5c00] py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all outline-none"
                    >
                      CHEGUEI NO LOCAL
                    </button>
                  )}
                  {activeOrder.status === OrderStatus.ARRIVED && (
                    <button
                      onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)}
                      className="w-full bg-emerald-500 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all outline-none"
                    >
                      FINALIZAR ENTREGA
                    </button>
                  )}
                  <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest mt-4">Ao atualizar o status, o cliente receberá uma notificação.</p>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: MAPA E ITENS */}
            <div className="space-y-4">
              <div className="bg-[#1a2c35] rounded-[2rem] overflow-hidden border border-white/5 h-64 relative group shadow-2xl">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                ></iframe>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a2c35] to-transparent h-20"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/50 bg-black/40 px-3 py-1 rounded-full border border-white/5">Visualização de Entrega</span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`)}`}
                    target="_blank"
                    className="bg-primary text-white px-4 py-2 rounded-xl font-black text-[10px] shadow-2xl flex items-center gap-2 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    Abrir GPS
                  </a>
                </div>
              </div>

              <div className="bg-[#1a2c35] p-6 rounded-[2rem] border border-white/5 flex-1">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Itens Detalhados</span>
                  <span className="text-[10px] font-black text-primary uppercase">{activeOrder.items.length} Itens</span>
                </div>
                <div className="space-y-3">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase italic tracking-tighter">{item.productName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Cód: #00{idx + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">R$ {item.price.toFixed(2)}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase">unid.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão de WhatsApp de Suporte do Escritório */}
              <div className="bg-emerald-500/5 p-4 rounded-[1.5rem] border border-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">support_agent</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">WhatsApp Business</p>
                    <p className="text-[10px] font-bold text-slate-400">Suporte do Escritório</p>
                  </div>
                </div>
                <a
                  href="https://api.whatsapp.com/send?phone=5515998148402"
                  target="_blank"
                  className="size-10 bg-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-xl">send</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER INDICATOR */}
      <footer className="p-3 bg-[#0b141a]/80 backdrop-blur-md border-t border-white/5 flex items-center justify-center gap-4 fixed bottom-0 w-full z-40">
        <div className="flex items-center gap-1.5 grayscale opacity-50">
          <span className="size-1.5 bg-primary rounded-full"></span>
          <span className="text-[8px] font-black uppercase tracking-widest">MeuGás Digital v3.7.0</span>
        </div>
        <div className="w-px h-3 bg-white/10"></div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Servidor Online</span>
        </div>
      </footer>
    </div>
  );
};

export default DriverDashboardView;
