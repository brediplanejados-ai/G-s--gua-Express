
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onUpdateOrder: (order: Order) => void;
}

const OrderDetailView: React.FC<OrderDetailProps> = ({ order, onBack, onUpdateOrder }) => {
  const [message, setMessage] = useState('');

  const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleStatusChange = (newStatus: OrderStatus) => {
    onUpdateOrder({ ...order, status: newStatus });
  };

  const handleAssignDriver = () => {
    onUpdateOrder({ ...order, driver: 'Carlos E.', status: OrderStatus.ACCEPTED });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const itemsText = order.items.map(i => `• ${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
    const text = `*RECIBO DE PEDIDO - GÁS & ÁGUA EXPRESS*\n\n` +
      `*Pedido:* ${order.id}\n` +
      `*Cliente:* ${order.customerName}\n` +
      `*Data:* ${order.date} às ${order.timestamp}\n\n` +
      `*Itens:*\n${itemsText}\n\n` +
      `*Total:* R$ ${total.toFixed(2)}\n` +
      `*Pagamento:* ${order.paymentMethod}\n` +
      `*Endereço:* ${order.address}, ${order.neighborhood}\n\n` +
      `Agradecemos a preferência! 🚚📦`;

    const encodedText = encodeURIComponent(text);
    const phone = order.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodedText}`, '_blank');
  };

  const timeline = [
    { status: OrderStatus.PENDING, label: 'Pedido Recebido', time: order.timestamp, done: true },
    { status: OrderStatus.ACCEPTED, label: 'Aceito pelo Entregador', time: order.status === OrderStatus.ACCEPTED || order.driver ? '10:35' : '-', done: !!order.driver },
    { status: OrderStatus.ON_ROUTE, label: 'Saindo para Entrega', time: order.status === OrderStatus.ON_ROUTE ? '10:42' : '-', done: order.status === OrderStatus.ON_ROUTE || order.status === OrderStatus.ARRIVED || order.status === OrderStatus.DELIVERED },
    { status: OrderStatus.ARRIVED, label: 'Chegou no Local', time: order.status === OrderStatus.ARRIVED ? '10:55' : '-', done: order.status === OrderStatus.ARRIVED || order.status === OrderStatus.DELIVERED },
    { status: OrderStatus.DELIVERED, label: 'Pedido Entregue', time: order.status === OrderStatus.DELIVERED ? '10:58' : '-', done: order.status === OrderStatus.DELIVERED },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#0b141a]">
      <header className="sticky top-0 z-10 bg-white dark:bg-[#1a2c35] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-500 hover:text-primary p-1">
              <span className="material-symbols-outlined font-black">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-black">{order.id}</h2>
              <span className="text-xs text-slate-500 font-bold uppercase">{order.timestamp}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1.5 
              ${order.status === OrderStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-100' :
                order.status === OrderStatus.DELIVERED ? 'bg-green-50 text-green-700 border-green-100' :
                  'bg-blue-50 text-blue-700 border-blue-100'}`}>
              <span className={`size-1.5 rounded-full ${order.status === OrderStatus.PENDING ? 'bg-amber-500 animate-pulse' : 'bg-current'}`}></span>
              {order.status}
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2 bg-[#25D366] text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-[#25D366]/20 hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] icon-fill">chat</span>
              WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Recibo
            </button>
            <button className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 dark:bg-red-900/10 dark:border-red-900/20 hover:bg-red-100 transition-colors">Cancelar</button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {/* Left Column - Details */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a2c35] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Cliente</h4>
            <div className="flex items-center gap-4 mb-4">
              <img src={order.avatar} className="size-14 rounded-2xl object-cover border-2 border-primary/10 shadow-sm" alt={order.customerName} />
              <div>
                <h3 className="font-black text-slate-900 dark:text-white leading-tight">{order.customerName}</h3>
                <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-tighter mt-1">
                  <span className="material-symbols-outlined text-[14px] icon-fill">verified</span>
                  <span>Premium</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#101c22] flex items-center justify-between text-sm font-bold border border-slate-100 dark:border-slate-800 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#25D366]">chat</span>
                  <span className="text-slate-700 dark:text-slate-300">{order.phone}</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-[18px]">open_in_new</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a2c35] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-5">
              <div>
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Informações de Entrega</h4>
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl h-fit text-primary">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div>
                    <p className="font-black leading-tight text-slate-900 dark:text-white text-lg">{order.address}</p>
                    <p className="text-sm text-slate-500 font-bold">{order.neighborhood}, {order.city}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit border border-blue-100/50">
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  {order.deliveryType}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Pagamento</h4>
                <div className="p-4 bg-slate-50 dark:bg-[#101c22] rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-600 text-xl">payments</span>
                      <span className="font-black text-slate-900 dark:text-white uppercase text-xs">{order.paymentMethod}</span>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white">R$ {total.toFixed(2)}</span>
                  </div>
                  {order.changeFor && (
                    <p className="text-[10px] font-bold text-amber-600 mt-1">Troco p/ R$ {order.changeFor.toFixed(2)}</p>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Observações</h4>
                  <div className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 italic font-medium leading-relaxed">
                    "{order.notes}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column - Status & Timeline */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a2c35] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Acompanhamento em Tempo Real</h3>
            </div>

            <div className="flex-1 p-8">
              <div className="space-y-8">
                {timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== timeline.length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-8 ${step.done ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                    )}
                    <div className={`size-8 rounded-full border-2 flex items-center justify-center z-10 
                      ${step.done ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300'}`}>
                      {step.done ? (
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      ) : (
                        <span className="text-[12px] font-black">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-black ${step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{step.label}</p>
                        <span className="text-[10px] font-bold text-slate-400">{step.time}</span>
                      </div>
                      {step.done && step.status === OrderStatus.ON_ROUTE && (
                        <p className="text-[10px] font-bold text-primary flex items-center gap-1 mt-1">
                          <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                          Localização do entregador sendo rastreada
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.status === OrderStatus.PENDING && (
              <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                <button
                  onClick={handleAssignDriver}
                  className="w-full py-4 bg-primary text-white rounded-xl font-black shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  DESPACHAR AGORA
                </button>
                <p className="text-[10px] text-center text-slate-400 font-bold px-4">Ao despachar, o entregador disponível mais próximo receberá uma notificação.</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1a2c35] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Itens Detalhados</h3>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">{order.items.length} itens</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((item, i) => (
                <div key={i} className="p-5 flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-slate-50 dark:bg-[#101c22] rounded-xl flex items-center justify-center text-primary font-black border border-slate-100 dark:border-slate-800 group-hover:bg-white transition-colors">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Cód: #00{i + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400 font-bold">R$ {item.price.toFixed(2)} un.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Map & Chat */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#1a2c35] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mapa de Entrega</h3>
              {order.driver && (
                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-black uppercase tracking-tighter border border-green-100">GPS Ativo</span>
              )}
            </div>
            <div className="h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${order.address}, ${order.neighborhood}, ${order.city}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                className="opacity-80"
              ></iframe>
              <div className="absolute top-4 right-4 print:hidden">
                <button
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address}, ${order.neighborhood}, ${order.city}`)}`;
                    navigator.clipboard.writeText(url);
                    alert('Link de rastreio copiado para a área de transferência!');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-[10px] font-black uppercase text-primary border border-primary/20 hover:scale-105 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                  Link de Rastreio
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#101c22] rounded-xl border border-slate-100 dark:border-slate-800">
                <img src="https://i.pravatar.cc/150?u=carlos" className="size-10 rounded-xl" alt="Driver" />
                <div className="flex-1">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-tighter leading-none mb-1">Entregador</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{order.driver || 'Não atribuído'}</p>
                </div>
                {order.driver && (
                  <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </button>
                )}
              </div>

              {order.driver && (
                <button
                  onClick={() => {
                    const address = encodeURIComponent(`${order.address}, ${order.neighborhood}, ${order.city}`);
                    window.open(`https://waze.com/ul?q=${address}&navigate=yes`, '_blank');
                  }}
                  className="w-full py-3 bg-[#33ccff]/10 hover:bg-[#33ccff]/20 text-[#2db9e6] rounded-xl font-black text-xs flex items-center justify-center gap-2 border border-[#33ccff]/20 transition-all uppercase"
                >
                  <span className="material-symbols-outlined text-[18px]">navigation</span>
                  Acompanhar no Waze
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a2c35] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[300px]">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="bg-[#25D366]/10 p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[#25D366] text-[20px] icon-fill">chat</span>
              </div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp Business</h3>
            </div>
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto flex flex-col gap-2">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs font-medium max-w-[90%]">
                Olá! Pedido sendo preparado.
                <span className="block text-[8px] text-slate-400 mt-1 uppercase font-bold text-right">10:45</span>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input type="text" className="flex-1 text-xs border-none bg-slate-50 dark:bg-slate-800 rounded-lg p-3" placeholder="Mensagem rápida..." />
              <button className="p-2 bg-primary text-white rounded-lg"><span className="material-symbols-outlined text-[20px]">send</span></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailView;


