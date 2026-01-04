import React, { useState, useEffect, useRef } from 'react';
import { WhatsAppNumber, AutoMessage, ChatMessage, Customer } from '../types';

interface WhatsAppViewProps {
    waNumbers: WhatsAppNumber[];
    autoMessages: AutoMessage[];
    chatHistory: ChatMessage[];
    onAddChatMessage: (msg: ChatMessage) => void;
    customers: Customer[];
}

const WhatsAppView: React.FC<WhatsAppViewProps> = ({ waNumbers, autoMessages, chatHistory, onAddChatMessage, customers }) => {
    const [selectedOfficeNumber, setSelectedOfficeNumber] = useState(waNumbers[0]?.id || '');
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, activeChatId]);

    // Lista de conversas únicas baseadas no fromNumber
    const conversations = Array.from(new Set(chatHistory.filter(m => m.toNumber === selectedOfficeNumber).map(m => m.fromNumber)));

    const handleSimulateReceive = () => {
        if (!inputText.trim()) return;

        const fromNum = '(11) 99999-8888'; // Simulando um cliente fixo para o teste
        const newInMsg: ChatMessage = {
            id: Date.now().toString(),
            fromNumber: fromNum,
            toNumber: selectedOfficeNumber,
            text: inputText,
            type: 'in',
            timestamp: new Date().toISOString()
        };

        onAddChatMessage(newInMsg);
        setInputText('');
        setActiveChatId(fromNum);

        // Lógica do Atendente Virtual
        setTimeout(() => {
            const isRegistered = customers.some(c => c.phone.replace(/\D/g, '').includes(fromNum.replace(/\D/g, '')));
            let botResponse = '';

            const lowerText = inputText.toLowerCase();
            if (lowerText.includes('oi') || lowerText.includes('olá')) {
                botResponse = autoMessages.find(m => m.id === 'saudacao')?.text || '';
            } else if (!isRegistered && chatHistory.filter(m => m.fromNumber === fromNum).length < 2) {
                botResponse = autoMessages.find(m => m.id === 'cadastro')?.text || '';
            } else if (lowerText.includes('gas') || lowerText.includes('agua') || lowerText.includes('gás') || lowerText.includes('água')) {
                botResponse = autoMessages.find(m => m.id === 'pagamento')?.text || '';
            } else {
                botResponse = 'Entendido! Estou processando seu pedido. Aguarde um momento.';
            }

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                fromNumber: selectedOfficeNumber,
                toNumber: fromNum,
                text: botResponse,
                type: 'out',
                timestamp: new Date().toISOString()
            };
            onAddChatMessage(botMsg);
        }, 1500);
    };

    const currentChat = chatHistory.filter(m =>
        (m.fromNumber === activeChatId && m.toNumber === selectedOfficeNumber) ||
        (m.fromNumber === selectedOfficeNumber && m.toNumber === activeChatId)
    );

    return (
        <main className="flex h-full bg-white dark:bg-[#0b141a] overflow-hidden">
            {/* Sidebar de Conversas */}
            <div className="w-80 border-r border-slate-100 dark:border-white/5 flex flex-col">
                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">chat</span>
                        Mensagens
                    </h2>
                    <select
                        value={selectedOfficeNumber}
                        onChange={(e) => setSelectedOfficeNumber(e.target.value)}
                        className="w-full mt-4 bg-slate-50 dark:bg-[#1a2c35] border-2 border-slate-100 dark:border-white/5 rounded-xl p-3 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:border-primary"
                    >
                        {waNumbers.map(n => (
                            <option key={n.id} value={n.id}>{n.label} ({n.number})</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <span className="material-symbols-outlined text-4xl">inbox</span>
                            <p className="text-[10px] font-black uppercase mt-2">Nenhuma conversa</p>
                        </div>
                    ) : (
                        conversations.map(num => (
                            <button
                                key={num}
                                onClick={() => setActiveChatId(num)}
                                className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${activeChatId === num ? 'bg-primary/10 border-2 border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                                <div className="size-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">person</span>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{num}</p>
                                    <p className="text-[10px] font-bold text-slate-400 truncate">Clique para visualizar o histórico</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Janela de Chat */}
            <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-[#080f14]">
                {activeChatId ? (
                    <>
                        <div className="p-4 bg-white/80 dark:bg-[#1a2c35]/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                                    {activeChatId.slice(-2)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{activeChatId}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Atendente Virtual Ativo
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {currentChat.map(msg => (
                                <div key={msg.id} className={`flex ${msg.type === 'in' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm ${msg.type === 'in' ? 'bg-white dark:bg-[#1a2c35] text-slate-900 dark:text-white rounded-tl-none' : 'bg-primary text-white rounded-tr-none font-medium'}`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-[9px] mt-1 opacity-50 ${msg.type === 'in' ? 'text-slate-400' : 'text-white'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-6 bg-white dark:bg-[#1a2c35] border-t border-slate-100 dark:border-white/5">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSimulateReceive()}
                                    placeholder="Simular mensagem recebida do cliente..."
                                    className="flex-1 bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                                />
                                <button
                                    onClick={handleSimulateReceive}
                                    className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-center mt-3 font-bold text-slate-400 uppercase">
                                Este é um simulador para testar as perguntas automáticas do seu atendente virtual.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 italic">
                        <span className="material-symbols-outlined text-6xl mb-4">chat_bubble</span>
                        <p className="font-black uppercase tracking-widest">Selecione uma conversa para simular o atendimento</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default WhatsAppView;
