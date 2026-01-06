
import React from 'react';
import { Order, OrderStatus, Driver } from '../types';

interface DriverDashboardProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  driver: Driver;
  onEndShift: () => void;
}

const DriverDashboardView: React.FC<DriverDashboardProps> = ({ orders, onUpdateOrder, driver, onEndShift }) => {
  const [showNewOrderModal, setShowNewOrderModal] = React.useState(false);
  const [lastOrderAssignedId, setLastOrderAssignedId] = React.useState<string | null>(null);

  const currentDriverName = driver.name;

  // Filter orders for this driver
  const myOrders = orders.filter(o => o.driver === currentDriverName)
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.timestamp}`).getTime();
      const dateB = new Date(`${b.date} ${b.timestamp}`).getTime();
      return dateA - dateB;
    });

  const activeOrder = myOrders.find(o => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED);

  // Monitorar novos pedidos atribuídos
  React.useEffect(() => {
    const pendingAssignment = myOrders.find(o => o.status === OrderStatus.PENDING);
    if (pendingAssignment && pendingAssignment.id !== lastOrderAssignedId) {
      setLastOrderAssignedId(pendingAssignment.id);
      setShowNewOrderModal(true);
      // Som de notificação (opcional)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
        audio.play();
      } catch (e) { }
    }
  }, [myOrders, lastOrderAssignedId]);

  // Dinamização dos contadores
  const completedOrders = orders.filter(o => o.driver === currentDriverName && o.status === OrderStatus.DELIVERED);
  const totalGains = completedOrders.reduce((acc, o) => acc + o.total, 0);

  const handleUpdateStatus = (status: OrderStatus) => {
    if (activeOrder) {
      onUpdateOrder({
        ...activeOrder,
        status,
        driver: currentDriverName
      });

      // Simulação de Notificação WhatsApp
      const message = `Olá ${activeOrder.customerName}, sua entrega do Gás & Água Express mudou para: *${status}*.`;
      console.log(`[WhatsApp Simulado para ${activeOrder.phone}]: ${message}`);
      // Abre o link do WhatsApp para o entregador enviar manualmente se necessário
      const waUrl = `https://wa.me/${activeOrder.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      if (status === OrderStatus.ON_ROUTE || status === OrderStatus.ARRIVED) {
        window.open(waUrl, '_blank');
      }
    }
  };

  const openWaze = () => {
    if (activeOrder) {
      const address = encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`);
      window.open(`https://waze.com/ul?q=${address}&navigate=yes`, '_blank');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-slate-100 text-slate-800 border-slate-200';
      case OrderStatus.ACCEPTED: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.ON_ROUTE: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.ARRIVED: return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleExportExcel = () => {
    const data = myOrders.map(o => ({
      ID: o.id,
      Cliente: o.customerName,
      Status: o.status,
      Total: o.total,
      Metodo: o.paymentMethod,
      Data: o.timestamp
    }));

    const csvContent = "data:text/csv;charset=utf-8,"
      + ["ID,Cliente,Status,Total,Metodo,Data", ...data.map(r => Object.values(r).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_${driver.id}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();

    alert("Relatório de atividades exportado para Excel (CSV). Histórico arquivado anualmente.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0b141a] font-body overflow-hidden">
      {/* Driver Header */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2c35] px-6 py-4 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-10 flex items-center justify-center bg-primary/10 rounded-xl text-primary">
            <span className="material-symbols-outlined text-2xl icon-fill">two_wheeler</span>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{driver.name}</h2>
            <div className="flex items-center gap-1.5">
              <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Em Serviço • {driver.vehicle.model}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onEndShift}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-black text-xs transition-all border border-red-100"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            SAIR
          </button>
          <img src={driver.avatar} className="size-10 rounded-full border-2 border-primary/20 shadow-sm" alt="Driver" />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left List - Order History/Queue */}
        <aside className="w-[380px] hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a2c35]">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Resumo Financeiro</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-[#101c22] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <span className="text-slate-400 text-[10px] font-black uppercase block mb-1">Entregas</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {completedOrders.length}
                </span>
              </div>
              <div className="bg-white dark:bg-[#101c22] p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <span className="text-slate-400 text-[10px] font-black uppercase block mb-1">Ganhos</span>
                <span className="text-2xl font-black text-primary flex items-center gap-2">
                  <span className="text-sm font-bold opacity-50">R$</span> {totalGains.toFixed(0)}
                </span>
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border border-green-200"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Exportar Dia (Excel)
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <h3 className="text-[10px] font-black px-1 text-slate-400 uppercase tracking-widest">Minha Fila</h3>
            {myOrders.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-slate-200 text-6xl mb-2">auto_awesome</span>
                <p className="text-sm text-slate-400 font-bold">Nenhum pedido pendente</p>
              </div>
            ) : (
              myOrders.map(o => (
                <div
                  key={o.id}
                  className={`rounded-2xl p-4 transition-all cursor-pointer border-2 ${activeOrder?.id === o.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#101c22]'
                    }`}
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{o.id}</h4>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">{o.timestamp}</span>
                    </div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 mb-1">{o.customerName}</p>
                    <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1 italic">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {o.address}, {o.neighborhood}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {o.items.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md text-[9px] font-black uppercase text-slate-500">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-50 dark:border-white/5 pt-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total a Receber</p>
                        <p className="text-lg font-black text-emerald-600">R$ {o.total.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => {
                          const address = encodeURIComponent(`${o.address}, ${o.neighborhood}, ${o.city}`);
                          window.open(`https://waze.com/ul?q=${address}&navigate=yes`, '_blank');
                        }}
                        className="bg-primary/10 text-primary p-2 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-all"
                        title="Abrir no Waze"
                      >
                        <span className="material-symbols-outlined">directions_car</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Right Detail - Active Order Focus */}
        <section className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b141a] p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {!activeOrder ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="size-32 bg-white dark:bg-[#1a2c35] rounded-full flex items-center justify-center shadow-2xl mb-8">
                  <span className="material-symbols-outlined text-6xl text-slate-200 animate-pulse">local_shipping</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Aguardando Pedidos...</h1>
                <p className="text-slate-500 max-w-sm font-medium">Você está na fila de espera. Assim que surgir um pedido na sua região, ele aparecerá aqui.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Pedido Ativo</span>
                      <span className="text-slate-400 font-bold text-sm">{activeOrder.id}</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                      {activeOrder.customerName}
                    </h1>
                    <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Recebido há 12 min
                    </p>
                  </div>

                  <div className={`px-6 py-3 rounded-2xl border-2 font-black text-xl shadow-xl transition-all ${getStatusColor(activeOrder.status)}`}>
                    {activeOrder.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Map & Actions */}
                  <div className="md:col-span-7 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1a2c35] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden group">
                      <div className="h-64 sm:h-80 bg-slate-100 dark:bg-slate-900 relative">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          allowFullScreen
                          className="opacity-90"
                        ></iframe>
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <button
                            onClick={() => {
                              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeOrder.address}, ${activeOrder.neighborhood}, ${activeOrder.city}`)}`;
                              navigator.clipboard.writeText(url);
                              alert('Link de rastreio compartilhado gerado e copiado!');
                            }}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[18px]">share_location</span>
                            COMPARTILHAR ROTA
                          </button>
                        </div>
                        <button
                          onClick={openWaze}
                          className="absolute bottom-6 right-6 bg-[#33ccff] hover:bg-[#2db9e6] text-white px-6 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-2xl">navigation</span>
                          ABRIR WAZE
                        </button>
                      </div>
                      <div className="p-8">
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Endereço de Entrega</h3>
                        <div className="flex gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl h-fit">
                            <span className="material-symbols-outlined text-primary text-3xl">home_pin</span>
                          </div>
                          <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{activeOrder.address}</p>
                            <p className="text-lg text-slate-500 font-bold">{activeOrder.neighborhood} • {activeOrder.city}</p>
                          </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <button
                            onClick={() => window.open(`https://api.whatsapp.com/send?phone=5511999999999`, '_blank')}
                            className="py-4 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-2xl font-black flex items-center justify-center gap-2 transition-all border border-green-500/10"
                          >
                            <span className="material-symbols-outlined icon-fill">chat</span> Falar com Base
                          </button>
                          <button
                            onClick={() => window.location.href = `tel:+5511999999999`}
                            className="py-4 bg-slate-50 dark:bg-[#101c22] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black flex items-center justify-center gap-2 transition-all border border-slate-100 dark:border-slate-800"
                          >
                            <span className="material-symbols-outlined">call</span> Ligar
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a2c35] rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Itens & Observações</h3>
                      <div className="space-y-4">
                        {activeOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#101c22] rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">
                                {item.quantity}x
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                            </div>
                            <span className="font-black text-primary">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {activeOrder.notes && (
                        <div className="mt-6 p-5 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 rounded-r-2xl">
                          <p className="text-sm font-bold text-amber-800 dark:text-amber-200 italic">"{activeOrder.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment & Workflow */}
                  <div className="md:col-span-5 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1a2c35] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                      <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Financeiro</h3>
                        <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-end">
                            <span className="text-slate-500 font-bold">Total a Cobrar</span>
                            <span className="text-4xl font-black text-slate-900 dark:text-white">R$ {activeOrder.total.toFixed(2)}</span>
                          </div>
                          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl flex justify-between items-center border border-green-100 dark:border-green-900/20">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-green-600 text-2xl">payments</span>
                              <span className="font-black text-green-700 dark:text-green-400 uppercase text-xs">{activeOrder.paymentMethod}</span>
                            </div>
                            {activeOrder.changeFor && (
                              <div className="text-right">
                                <p className="text-[10px] font-black text-green-600/60 uppercase">Troco para</p>
                                <p className="text-lg font-black text-green-700 dark:text-green-400">R$ {activeOrder.changeFor.toFixed(2)}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col gap-4">
                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Atualizar Status da Rota</h3>

                        {activeOrder.status === OrderStatus.PENDING && (
                          <button
                            onClick={() => handleUpdateStatus(OrderStatus.ACCEPTED)}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                          >
                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                            RECEBER PEDIDO
                          </button>
                        )}

                        {activeOrder.status === OrderStatus.ACCEPTED && (
                          <button
                            onClick={() => handleUpdateStatus(OrderStatus.ON_ROUTE)}
                            className="w-full py-5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-yellow-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                          >
                            <span className="material-symbols-outlined text-2xl">delivery_dining</span>
                            SAIR PARA ENTREGA
                          </button>
                        )}

                        {activeOrder.status === OrderStatus.ON_ROUTE && (
                          <button
                            onClick={() => handleUpdateStatus(OrderStatus.ARRIVED)}
                            className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                          >
                            <span className="material-symbols-outlined text-2xl">person_pin_circle</span>
                            CHEGUEI NO LOCAL
                          </button>
                        )}

                        {(activeOrder.status === OrderStatus.ON_ROUTE || activeOrder.status === OrderStatus.ARRIVED) && (
                          <button
                            onClick={() => handleUpdateStatus(OrderStatus.CLIENT_ABSENT)}
                            className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-black text-sm border-2 border-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-lg">person_off</span>
                            CLIENTE AUSENTE
                          </button>
                        )}

                        {activeOrder.status === OrderStatus.ARRIVED && (
                          <button
                            onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)}
                            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-3xl font-black text-2xl shadow-2xl shadow-green-600/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
                          >
                            <span className="material-symbols-outlined text-3xl">task_alt</span>
                            PEDIDO ENTREGUE
                          </button>
                        )}

                        <p className="text-center text-[10px] text-slate-400 font-bold px-4">
                          Ao atualizar o status, o cliente e a central serão notificados automaticamente via WhatsApp e Painel de Controle.
                        </p>
                      </div>
                    </div>

                    <div className="bg-primary/5 dark:bg-primary/5 rounded-3xl p-6 border-2 border-primary/10 border-dashed">
                      <div className="flex gap-4">
                        <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                        <div>
                          <p className="font-black text-primary text-sm uppercase">Segurança em Primeiro Lugar</p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Lembre-se de utilizar todos os equipamentos de proteção e conferir o lacre do botijão antes da entrega.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Modal de Novo Pedido (Notificação Automática) */}
        {showNewOrderModal && activeOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1a2c35] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white/20 text-center animate-in zoom-in-95 duration-300">
              <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary ring-8 ring-primary/5">
                <span className="material-symbols-outlined text-5xl animate-bounce">notifications_active</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Nova Entrega!</h2>
              <p className="text-slate-500 font-bold mb-6">Você recebeu um novo pedido de <span className="text-slate-900 dark:text-white">{activeOrder.customerName}</span> nas proximidades.</p>

              <div className="bg-slate-50 dark:bg-[#101c22] p-4 rounded-2xl mb-8 text-left border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Endereço</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{activeOrder.address}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    handleUpdateStatus(OrderStatus.ACCEPTED);
                    setShowNewOrderModal(false);
                  }}
                  className="w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/30 transition-all active:scale-95"
                >
                  ACEITAR ENTREGA
                </button>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  FECHAR
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverDashboardView;
