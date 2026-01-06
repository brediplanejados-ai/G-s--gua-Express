
import React from 'react';
import { Order, OrderStatus, Driver } from '../types';

interface DriverDashboardProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  driver: Driver;
  onEndShift: () => void;
  onRefreshData?: () => Promise<void>;
  isSyncing?: boolean;
}

const DriverDashboardView: React.FC<DriverDashboardProps> = ({ orders, onUpdateOrder, driver, onEndShift, onRefreshData, isSyncing }) => {
  const [showNewOrderModal, setShowNewOrderModal] = React.useState(false);
  const [lastOrderAssignedId, setLastOrderAssignedId] = React.useState<string | null>(null);

  const currentDriverName = driver.name;

  // Filtro de pedidos para este entregador
  const myOrders = orders.filter(o => o.driver === currentDriverName)
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timestamp}`).getTime();
      const dateB = new Date(`${b.date} ${b.timestamp}`).getTime();
      return dateA - dateB;
    });

  const activeOrder = myOrders.find(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);

  // Monitorar novos pedidos de forma reativa
  React.useEffect(() => {
    const pendingAssignment = myOrders.find(o => o.status === OrderStatus.PENDING);
    if (pendingAssignment && pendingAssignment.id !== lastOrderAssignedId) {
      setLastOrderAssignedId(pendingAssignment.id);
      setShowNewOrderModal(true);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
        audio.play();
      } catch (e) { }
    }
  }, [myOrders, lastOrderAssignedId]);

  // Estatísticas do dia
  const completedOrders = orders.filter(o => o.driver === currentDriverName && o.status === OrderStatus.DELIVERED);
  const totalGains = completedOrders.reduce((acc, o) => acc + o.total, 0);

  const handleUpdateStatus = (status: OrderStatus) => {
    if (activeOrder) {
      onUpdateOrder({
        ...activeOrder,
        status,
        driver: currentDriverName
      });
    }
  };

  const openWaze = () => {
    if (activeOrder) {
      const address = encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`);
      window.open(`https://waze.com/ul?q=${address}&navigate=yes`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-white overflow-hidden mobile-safe-area">
      {/* Header Mobile Otimizado */}
      <header className="p-4 flex items-center justify-between bg-[#1a2c35] border-b border-white/5 shadow-2xl z-30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={driver.avatar} className="size-12 rounded-2xl border-2 border-primary/50 object-cover" alt="Perfil" />
            <span className="absolute -bottom-1 -right-1 size-4 bg-green-500 border-2 border-[#1a2c35] rounded-full"></span>
          </div>
          <div>
            <h2 className="font-black text-[10px] text-primary uppercase tracking-[0.2em]">Painel Entregador</h2>
            <h2 className="font-black text-sm uppercase tracking-tight text-white">{driver.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefreshData?.()}
            className={`size-10 flex items-center justify-center bg-white/5 rounded-xl active:scale-90 transition-all ${isSyncing ? 'animate-spin text-primary' : 'text-slate-400 hover:text-white'}`}
            title="Sincronizar Pedidos"
          >
            <span className="material-symbols-outlined font-black">sync</span>
          </button>
          <div className="hidden sm:block h-8 w-px bg-white/5 mx-1"></div>
          <div className="bg-black/20 px-3 py-2 rounded-xl text-right min-w-[60px]">
            <span className="text-[8px] font-black text-slate-400 block uppercase tracking-tighter">Entregas</span>
            <span className="text-sm font-black text-white">{completedOrders.length}</span>
          </div>
          <button
            onClick={onEndShift}
            className="size-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl active:scale-90 transition-all"
            title="Sair do Plantão"
          >
            <span className="material-symbols-outlined font-black">logout</span>
          </button>
        </div>
      </header>

      {/* Barra de Status de Comunicação / Sincronismo */}
      <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${isSyncing ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`}></span>
          <span className={isSyncing ? 'text-primary' : 'text-emerald-500'}>
            {isSyncing ? 'Sincronizando Nuvem...' : 'Sistema Online e Sincronizado'}
          </span>
        </div>
        <div className="text-slate-500">
          {driver.vehicle.model} • Ref: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Ganho do Dia Floating Bar */}
      <div className="px-4 py-3 bg-[#13a4ec]/10 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">payments</span>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ganhos Estimados Hoje</span>
        </div>
        <span className="text-lg font-black text-primary">R$ {totalGains.toFixed(0)}</span>
      </div>

      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!activeOrder ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="size-48 bg-white/5 rounded-[3rem] flex items-center justify-center mb-8 relative">
              <span className="material-symbols-outlined text-8xl text-white/10">moped</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-3 bg-primary rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Oline e Aguardando</h1>
            <p className="text-slate-400 font-bold max-w-[200px] text-center text-sm">Fique atento! Novos pedidos aparecerão aqui a qualquer momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-6 duration-500">
            {/* Card Principal de Entrega */}
            <div className="bg-[#1a2c35] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1">Destinatário</span>
                    <h2 className="text-2xl font-black text-white">{activeOrder.customerName}</h2>
                  </div>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                    ID: {activeOrder.id.slice(-4)}
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl flex-1 border border-white/5">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Endereço</span>
                    <p className="text-sm font-bold text-white leading-tight">{activeOrder.address}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{activeOrder.neighborhood}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button
                    onClick={openWaze}
                    className="flex flex-col items-center gap-2 p-4 bg-[#33ccff]/10 border border-[#33ccff]/20 rounded-2xl active:scale-95 transition-all text-[#33ccff]"
                  >
                    <span className="material-symbols-outlined text-3xl">navigation</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Waze</span>
                  </button>
                  <button
                    onClick={() => {
                      const message = `Olá ${activeOrder.customerName}! Sou seu entregador do MeuGás Digital e estou com seu pedido.`;
                      window.open(`https://api.whatsapp.com/send?phone=${activeOrder.phone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl active:scale-95 transition-all text-green-500"
                  >
                    <span className="material-symbols-outlined text-3xl">chat</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                  </button>
                </div>

                <div className="space-y-3 mb-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Itens do Pedido</span>
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="size-6 flex items-center justify-center bg-primary text-white text-[10px] font-black rounded-md">{item.quantity}x</span>
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-primary">R$ {item.total?.toFixed(2) || (item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {activeOrder.notes && (
                    <div className="p-3 bg-amber-500/10 border-l-2 border-amber-500 rounded-r-xl">
                      <p className="text-[10px] font-bold text-amber-200 italic">"Obs: {activeOrder.notes}"</p>
                    </div>
                  )}
                </div>

                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 flex justify-between items-end">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Pagamento em {activeOrder.paymentMethod}</span>
                    <p className="text-3xl font-black text-white">R$ {activeOrder.total.toFixed(2)}</p>
                  </div>
                  {activeOrder.changeFor && (
                    <div className="text-right">
                      <span className="text-[9px] font-black text-green-500 uppercase block mb-1">Troco para</span>
                      <p className="text-xl font-black text-green-500">R$ {activeOrder.changeFor.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ação Principal - Fluxo de Status */}
              <div className="p-4 bg-white/5 border-t border-white/5">
                {activeOrder.status === OrderStatus.ACCEPTED && (
                  <button
                    onClick={() => handleUpdateStatus(OrderStatus.ON_ROUTE)}
                    className="w-full py-6 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-3xl">moped</span>
                    SAIR PARA ENTREGA
                  </button>
                )}
                {activeOrder.status === OrderStatus.ON_ROUTE && (
                  <button
                    onClick={() => handleUpdateStatus(OrderStatus.ARRIVED)}
                    className="w-full py-6 bg-purple-500 text-white rounded-[1.5rem] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-3xl">person_pin_circle</span>
                    CHEGUEI NO LOCAL
                  </button>
                )}
                {activeOrder.status === OrderStatus.ARRIVED && (
                  <button
                    onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)}
                    className="w-full py-8 bg-green-500 text-white rounded-[2rem] font-black text-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    <span className="material-symbols-outlined text-4xl">verified</span>
                    FINALIZAR
                  </button>
                )}
              </div>
            </div>

            <p className="text-center text-[10px] font-bold text-slate-500 px-8 leading-relaxed opacity-50 uppercase tracking-widest">
              Suas coordenadas são compartilhadas em tempo real durante a rota de entrega.
            </p>
          </div>
        )}
      </main>

      {/* Modal Overlay de Novo Pedido (Impactante) */}
      {showNewOrderModal && activeOrder && (
        <div className="fixed inset-0 z-[100] bg-[#0b141a] p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-progress"></div>

          <div className="size-32 bg-primary/10 rounded-full flex items-center justify-center mb-8 ring-8 ring-primary/5">
            <span className="material-symbols-outlined text-6xl text-primary animate-bounce">notifications_active</span>
          </div>

          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Novo Pedido!</h1>
          <p className="text-lg font-bold text-slate-400 mb-12">Você recebeu uma entrega!</p>

          <div className="w-full bg-[#1a2c35] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl mb-12">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Destino</span>
            <h2 className="text-xl font-black text-white mb-4 leading-tight">{activeOrder.address}</h2>
            <div className="w-12 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>

          <button
            onClick={() => {
              handleUpdateStatus(OrderStatus.ACCEPTED);
              setShowNewOrderModal(false);
            }}
            className="w-full py-8 bg-primary text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/20 active:scale-95 transition-all uppercase italic tracking-tighter"
          >
            Aceitar Agora
          </button>

          <button
            onClick={() => setShowNewOrderModal(false)}
            className="mt-8 text-slate-500 font-black text-xs uppercase tracking-[0.3em] active:scale-90 transition-all hover:text-white"
          >
            Ignorar
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .mobile-safe-area {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}} />
    </div>
  );
};

export default DriverDashboardView;
