import React, { useState } from 'react';
import { AutoMessage, WhatsAppNumber, BackupConfig } from '../types';

interface SettingsProps {
  primaryColor: string;
  onColorChange: (color: string) => void;
  autoMessages: AutoMessage[];
  onUpdateAutoMessages: (msgs: AutoMessage[]) => void;
  waNumbers: WhatsAppNumber[];
  onUpdateWaNumbers: (nums: WhatsAppNumber[]) => void;
  backupConfig: BackupConfig;
  onUpdateBackup: (config: BackupConfig) => void;
}

const SettingsView: React.FC<SettingsProps> = ({
  primaryColor,
  onColorChange,
  autoMessages,
  onUpdateAutoMessages,
  waNumbers,
  onUpdateWaNumbers,
  backupConfig,
  onUpdateBackup
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'whatsapp' | 'backup'>('perfil');
  const [companyName, setCompanyName] = useState('Gás & Água Express LTDA');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [address, setAddress] = useState('Av. Paulista, 1000 - Bela Vista, São Paulo - SP');

  const colors = [
    { name: 'Padrão (Azul)', value: '#13a4ec' },
    { name: 'Chama (Laranja)', value: '#ff5c00' },
    { name: 'Eco (Verde)', value: '#10b981' },
    { name: 'VIP (Roxo)', value: '#8b5cf6' },
    { name: 'Alerta (Vermelho)', value: '#ef4444' },
    { name: 'Noite (Slate)', value: '#475569' },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-8 lg:p-12 bg-[#f8fafc] dark:bg-[#0b141a]">
      <header className="mb-12">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-4xl">settings</span>
          Configurações
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Gerencie o perfil da sua empresa e automações.</p>
      </header>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('perfil')}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'perfil' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-[#1a2c35] text-slate-400'}`}
        >
          Perfil da Empresa
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'whatsapp' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-[#1a2c35] text-slate-400'}`}
        >
          Automação WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'backup' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-[#1a2c35] text-slate-400'}`}
        >
          Backup e Dados
        </button>
      </div>

      {activeTab === 'perfil' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <section className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">business</span>
              Perfil da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome Fantasia</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CNPJ</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Endereço Principal</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl group cursor-pointer hover:border-primary/50 transition-all">
                <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-all mb-2">add_a_photo</span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-all">Logotipo da Empresa</span>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">palette</span>
              Cores do Sistema
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onColorChange(color.value)}
                  className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${primaryColor === color.value ? 'border-primary bg-primary/5' : 'border-transparent bg-slate-50 dark:bg-[#101c22] hover:border-slate-200 dark:hover:border-white/10'}`}
                >
                  <div className="size-10 rounded-full shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: color.value }}></div>
                  <span className={`text-[10px] font-black uppercase text-center ${primaryColor === color.value ? 'text-primary' : 'text-slate-400'}`}>{color.name}</span>
                </button>
              ))}
              <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#101c22] border-2 border-transparent">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="size-10 rounded-full cursor-pointer bg-transparent border-none"
                />
                <span className="text-[10px] font-black uppercase text-slate-400">Personalizada</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">phone_iphone</span>
              Números de WhatsApp do Escritório
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waNumbers.map((num) => (
                <div key={num.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#101c22] rounded-2xl border-2 border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">perm_phone_msg</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{num.number}</p>
                      <p className="text-[10px] font-bold text-slate-400">{num.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`size-3 rounded-full ${num.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <button className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors">delete</button>
                  </div>
                </div>
              ))}
              <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-primary hover:text-primary transition-all">
                <span className="material-symbols-outlined">add</span>
                Novo Número
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">smart_toy</span>
              Atendente Virtual (Chatbot)
            </h3>
            <div className="space-y-6">
              {autoMessages.map((msg) => (
                <div key={msg.id} className="group relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    {msg.id.charAt(0).toUpperCase() + msg.id.slice(1)}
                  </label>
                  <textarea
                    value={msg.text}
                    onChange={(e) => {
                      const newMsgs = autoMessages.map(m => m.id === msg.id ? { ...m, text: e.target.value } : m);
                      onUpdateAutoMessages(newMsgs);
                    }}
                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all min-h-[80px] resize-none"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white dark:bg-[#1a2c35] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">cloud_download</span>
              Backup e Exportação de Dados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 dark:bg-[#101c22] rounded-[2rem] border-2 border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">laptop_mac</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">Backup Local</h4>
                    <p className="text-[10px] font-bold text-slate-400">Salvar dados no computador (JSON)</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const data = { autoMessages, waNumbers, companyName, cnpj, address, backupConfig };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `backup_gas_agua_${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                    onUpdateBackup({ ...backupConfig, lastLocalBackup: new Date().toISOString() });
                  }}
                  className="w-full bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Baixar Backup Agora
                </button>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-[#101c22] rounded-[2rem] border-2 border-slate-100 dark:border-white/5 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 rounded-2xl bg-[#4285F4]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#4285F4] text-2xl">cloud_sync</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">Nuvem (Google Drive)</h4>
                    <p className="text-[10px] font-bold text-slate-400">Sincronização automática</p>
                  </div>
                </div>
                {!backupConfig.googleDriveConnected ? (
                  <button
                    onClick={() => onUpdateBackup({ ...backupConfig, googleDriveConnected: true })}
                    className="w-full bg-[#4285F4] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#4285F4]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                    Conectar Google Drive
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Conectado
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default SettingsView;
