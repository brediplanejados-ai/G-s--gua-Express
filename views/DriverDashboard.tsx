
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
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [lastOrderAssignedId, setLastOrderAssignedId] = React.useState<string | null>(null);

  const currentDriverName = driver.name;

  // Filtro de pedidos para este entregador
  const myOrders = orders.filter(o => o.driver === currentDriverName)
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timestamp}`).getTime();
      const dateB = new Date(`${b.date} ${b.timestamp}`).getTime();
      return dateB - dateA; // Mostrar os mais novos primeiro na história
    });

  const activeOrder = myOrders.find(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);

  // Monitorar novos pedidos
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

  // Estatísticas do turno atual (Hoje)
  const today = new Date().toISOString().split('T')[0];
  const completedToday = orders.filter(o => o.driver === currentDriverName && o.status === OrderStatus.DELIVERED && o.date === today);

  const gainsBreakdown = completedToday.reduce((acc, o) => {
    const method = o.paymentMethod || 'Dinheiro';
    if (!acc[method]) acc[method] = 0;
    acc[method] += o.total;
    return acc;
  }, {} as Record<string, number>);

  const totalGainsToday = Object.values(gainsBreakdown).reduce((a, b) => a + b, 0);

  const handleUpdateStatus = (status: OrderStatus) => {
    if (activeOrder) {
      onUpdateOrder({
        ...activeOrder,
        status,
        driver: currentDriverName
      });
    }
  };

  const handleRefuseOrder = () => {
    if (activeOrder) {
      onUpdateOrder({
        ...activeOrder,
        status: OrderStatus.PENDING,
        driver: undefined // Liberar para outros entregadores
      });
      setShowNewOrderModal(false);
    }
  };

  const openWaze = () => {
    if (activeOrder) {
      const address = encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`);
      window.open(`https://waze.com/ul?q=${address}&navigate=yes`, '_blank');
    }
  };

  // Funções de Histórico
  const getHistoryStats = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const historicalOrders = orders.filter(o =>
      o.driver === currentDriverName &&
      o.status === OrderStatus.DELIVERED &&
      new Date(o.date) >= cutoffDate
    );

    return {
      count: historicalOrders.length,
      total: historicalOrders.reduce((a, b) => a + b.total, 0)
    };
  };

  return (
    <div className="flex flex-col h-full bg-[#0b141a] text-white overflow-hidden mobile-safe-area">
      {/* Header Premium */}
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
          <button
            onClick={() => setShowHistoryModal(true)}
            className="size-10 flex items-center justify-center bg-white/5 text-slate-400 rounded-xl active:scale-90 transition-all"
            title="Histórico"
          >
            <span className="material-symbols-outlined font-black">history</span>
          </button>
          <button
            onClick={onEndShift}
            className="size-10 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl active:scale-90 transition-all"
            title="Sair do Plantão"
          >
            <span className="material-symbols-outlined font-black">logout</span>
          </button>
        </div>
      </header>

      {/* Sincronização & Identificação */}
      <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${isSyncing ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`}></span>
          <span className={isSyncing ? 'text-primary' : 'text-emerald-500'}>
            {isSyncing ? 'Sincronizando...' : 'Online'}
          </span>
        </div>
        <div className="text-slate-500">
          {driver.vehicle.model} • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* DETALHAMENTO FINANCEIRO RÁPIDO */}
      <div className="bg-[#13a4ec]/5 border-b border-white/5 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-6 p-4 min-w-max">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-primary uppercase tracking-widest mb-1">Total Hoje</span>
            <span className="text-xl font-black text-white">R$ {totalGainsToday.toFixed(0)}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Dinheiro</span>
            <span className="text-xs font-black text-slate-300">R$ {(gainsBreakdown['Dinheiro'] || 0).toFixed(0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Cartão</span>
            <span className="text-xs font-black text-slate-300">R$ {(gainsBreakdown['Cartão'] || 0).toFixed(0)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">PIX</span>
            <span className="text-xs font-black text-slate-300">R$ {(gainsBreakdown['Pix'] || 0).toFixed(0)}</span>
          </div>
          <div className="flex flex-col items-end flex-1 ml-4 px-2 bg-white/5 rounded-lg py-1 border border-white/5">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Turno</span>
            <span className="text-sm font-black text-white">{completedToday.length} Entregas</span>
          </div>
        </div>
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
            <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic">Pronto para a Próxima!</h1>
            <p className="text-slate-400 font-bold max-w-[200px] text-center text-sm">O sistema está buscando pedidos automatizados na sua localidade.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-6 duration-500">
            {/* Mapa GPS Automático */}
            <div className="bg-[#1a2c35] rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-48 relative group">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2c35] to-transparent pointer-events-none"></div>
              <button
                onClick={openWaze}
                className="absolute bottom-4 right-4 bg-[#33ccff] text-white px-4 py-2 rounded-xl font-black text-xs shadow-2xl flex items-center gap-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-sm">navigation</span>
                INICIAR NAVEGAÇÃO GPS
              </button>
            </div>

            {/* Card com Detalhes do Destino */}
            <div className="bg-[#1a2c35] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1">Destinatário</span>
                  <h2 className="text-2xl font-black text-white">{activeOrder.customerName}</h2>
                </div>
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase">
                  ID: {activeOrder.id.slice(-4)}
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl mb-8 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white leading-tight">{activeOrder.address}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{activeOrder.neighborhood} • {activeOrder.city}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => {
                    const message = `Olá ${activeOrder.customerName}! Sou seu entregador do MeuGás Digital e estou com seu pedido.`;
                    window.open(`https://api.whatsapp.com/send?phone=${activeOrder.phone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-green-500/10 border border-green-500/10 rounded-2xl active:scale-95 transition-all text-green-500"
                >
                  <span className="material-symbols-outlined text-3xl">chat</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp Cliente</span>
                </button>
                <button
                  onClick={() => window.location.href = `tel:${activeOrder.phone.replace(/\D/g, '')}`}
                  className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl active:scale-95 transition-all text-slate-400"
                >
                  <span className="material-symbols-outlined text-3xl">call</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Ligar Agora</span>
                </button>
              </div>

              {/* Itens e Observações */}
              <div className="space-y-3 mb-8">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-1">Resumo da Carga</span>
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-white text-[12px] font-black size-8 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">{item.quantity}</div>
                      <span className="text-sm font-bold text-slate-200">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-primary">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financeiro do Pedido */}
              <div className="bg-black/30 p-6 rounded-[2rem] border border-white/5 flex justify-between items-end mb-8">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Receber via {activeOrder.paymentMethod}</span>
                  <p className="text-4xl font-black text-white">R$ {activeOrder.total.toFixed(2)}</p>
                </div>
                {activeOrder.changeFor && (
                  <div className="text-right">
                    <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1">Troco p/</span>
                    <p className="text-2xl font-black text-emerald-500">R$ {activeOrder.changeFor.toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Fluxo de Status */}
              <div className="flex flex-col gap-3">
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
                    className="w-full py-8 bg-green-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4"
                  >
                    <span className="material-symbols-outlined text-4xl">verified</span>
                    FINALIZAR ENTREGA
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE HISTÓRICO (Semanal, Mensal, Anual) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] bg-[#0b141a]/95 backdrop-blur-xl p-6 flex flex-col animate-in fade-in duration-300">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Meu Histórico</h2>
            <button onClick={() => setShowHistoryModal(false)} className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-2">Últimos 7 dias (Semanal)</span>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black">{getHistoryStats(7).count} <span className="text-xs font-bold text-slate-500 uppercase">Fitas</span></span>
                <span className="text-2xl font-black text-primary">R$ {getHistoryStats(7).total.toFixed(0)}</span>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block mb-2">Último Mês</span>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black">{getHistoryStats(30).count} <span className="text-xs font-bold text-slate-500 uppercase">Fitas</span></span>
                <span className="text-2xl font-black text-blue-400">R$ {getHistoryStats(30).total.toFixed(0)}</span>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] block mb-2">Este Ano (Anual)</span>
              <div className="flex justify-between items-end">
                <span className="text-3xl font-black">{getHistoryStats(365).count} <span className="text-xs font-bold text-slate-500 uppercase">Fitas</span></span>
                <span className="text-2xl font-black text-purple-400">R$ {getHistoryStats(365).total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Últimas 20 Entregas</h3>
            {myOrders.slice(0, 20).filter(o => o.status === OrderStatus.DELIVERED).map(o => (
              <div key={o.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white">{o.customerName}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">{o.date} • {o.paymentMethod}</p>
                </div>
                <span className="text-sm font-black text-primary">R$ {o.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Overlay de Novo Pedido (Com opção de RECUSAR) */}
      {showNewOrderModal && activeOrder && (
        <div className="fixed inset-0 z-[100] bg-[#0b141a] p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-progress"></div>

          <div className="size-32 bg-primary/10 rounded-full flex items-center justify-center mb-8 ring-8 ring-primary/5">
            <span className="material-symbols-outlined text-6xl text-primary animate-bounce">notifications_active</span>
          </div>

          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Novo Pedido!</h1>
          <p className="text-lg font-bold text-slate-400 mb-12">Entrega disponível em <span className="text-white">{activeOrder.neighborhood}</span></p>

          <div className="w-full bg-[#1a2c35] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl mb-12">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Destinatário</span>
            <h2 className="text-xl font-black text-white mb-1 leading-tight">{activeOrder.customerName}</h2>
            <p className="text-xs font-bold text-slate-500 uppercase">{activeOrder.address}</p>
          </div>

          <div className="w-full flex flex-col gap-4">
            <button
              onClick={() => {
                handleUpdateStatus(OrderStatus.ACCEPTED);
                setShowNewOrderModal(false);
              }}
              className="w-full py-8 bg-primary text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-primary/20 active:scale-95 transition-all uppercase italic tracking-tighter"
            >
              ACEITAR AGORA
            </button>

            <button
              onClick={handleRefuseOrder}
              className="w-full py-5 bg-red-500/10 text-red-500 rounded-[1.5rem] font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
            >
              RECUSAR PEDIDO
            </button>
          </div>
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
};

export default DriverDashboardView;
