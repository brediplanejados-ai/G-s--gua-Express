import React, { useState } from 'react';
import { AutoMessage, WhatsAppNumber, BackupConfig, Tenant } from '../types';

interface SettingsProps {
  primaryColor: string;
  onColorChange: (color: string) => void;
  autoMessages: AutoMessage[];
  onUpdateAutoMessages: (msgs: AutoMessage[]) => void;
  waNumbers: WhatsAppNumber[];
  onUpdateWaNumbers: (nums: WhatsAppNumber[]) => void;
  backupConfig: BackupConfig;
  onUpdateBackup: (config: BackupConfig) => void;
  pixKey: string;
  onUpdatePix: (pix: string) => void;
  adminLogin: string;
  adminPassword: string;
  onUpdateAdminCredentials: (login: string, pass: string) => void;
  onImportBackup?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadBackup?: () => void;
  onUpdateLogo?: (logo: string | null) => void;
  tenant: Tenant;
  onUpdateTenant: (updated: Tenant) => void;
}

const SettingsView: React.FC<SettingsProps> = ({
  primaryColor,
  onColorChange,
  autoMessages,
  onUpdateAutoMessages,
  waNumbers,
  onUpdateWaNumbers,
  backupConfig,
  onUpdateBackup,
  pixKey,
  onUpdatePix,
  adminLogin,
  adminPassword,
  onUpdateAdminCredentials,
  onImportBackup,
  onDownloadBackup,
  onUpdateLogo,
  tenant,
  onUpdateTenant
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'whatsapp' | 'backup'>('perfil');
  const [companyName, setCompanyName] = useState(tenant.name);
  const [cnpj, setCnpj] = useState(tenant.cnpj || '');
  const [zipCode, setZipCode] = useState(tenant.zipCode || '');
  const [street, setStreet] = useState(tenant.street || '');
  const [number, setNumber] = useState(tenant.number || '');
  const [neighborhood, setNeighborhood] = useState(tenant.neighborhood || '');
  const [city, setCity] = useState(tenant.city || '');
  const [logo, setLogo] = useState<string | null>(tenant.logo || null);
  const [localPixKey, setLocalPixKey] = useState(pixKey);

  const handleSave = () => {
    const updatedTenant: Tenant = {
      ...tenant,
      name: companyName,
      cnpj,
      zipCode,
      street,
      number,
      neighborhood,
      city,
      logo: logo || undefined,
      pixKey: localPixKey
    };
    onUpdateTenant(updatedTenant);
    onUpdatePix(localPixKey);
    alert('Alterações salvas com sucesso!');
  };

  const handleCepChange = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, '');
    setZipCode(cleanedCep);
    if (cleanedCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setStreet(data.logradouro);
          setNeighborhood(data.bairro);
          setCity(data.localidade);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CEP (Busca Auto)</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cidade</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rua / Logradouro</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Número</label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bairro</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl p-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chave PIX do Estabelecimento</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">payments</span>
                    <input
                      type="text"
                      value={localPixKey}
                      onChange={(e) => setLocalPixKey(e.target.value)}
                      placeholder="e-mail, CPF ou Aleatória"
                      className="w-full bg-slate-50 dark:bg-[#101c22] border-2 border-slate-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 dark:text-white outline-none focus:border-primary transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Seção de Segurança / Login */}
                <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10 space-y-4">
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lock_person</span>
                    Segurança do Administrador
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Usuário de Login</label>
                      <input
                        type="text"
                        value={adminLogin}
                        readOnly
                        className="w-full bg-slate-200/50 dark:bg-black/20 border-white/5 rounded-xl p-3 text-xs font-bold text-slate-500 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Trocar Senha</label>
                      <div className="relative">
                        <input
                          type="text"
                          defaultValue={adminPassword}
                          onBlur={(e) => onUpdateAdminCredentials(adminLogin, e.target.value)}
                          className="w-full bg-white dark:bg-[#101c22] border-2 border-amber-500/20 rounded-xl p-3 text-xs font-black text-slate-900 dark:text-white outline-none focus:border-primary transition-all"
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 text-sm">edit</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[8px] text-amber-600 font-bold leading-tight">
                    * Alterar sua senha aqui também atualiza o acesso para o suporte do criador do sistema.
                  </p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl group cursor-pointer hover:border-primary/50 transition-all min-h-[300px] w-full overflow-hidden bg-slate-50/50 dark:bg-black/10"
                >
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain mb-4" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-all mb-2">add_a_photo</span>
                  )}
                  <h4 className="text-white text-base font-black uppercase tracking-tight italic">MeuGás Digital</h4>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-all">
                    {logo ? 'Trocar Logotipo' : 'Logotipo da Empresa'}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-2">Clique p/ Galeria ou Câmera</p>
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">save</span>
                SALVAR ALTERAÇÕES
              </button>
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
                    <button
                      onClick={() => onUpdateWaNumbers(waNumbers.filter(n => n.id !== num.id))}
                      className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors"
                    >
                      delete
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const number = prompt('Digite o número do WhatsApp (com DDD):');
                  const label = prompt('Digite uma etiqueta (ex: Suporte, Vendas):');
                  if (number && label) {
                    onUpdateWaNumbers([...waNumbers, { id: 'wa' + Date.now(), number, label, status: 'active' }]);
                  }
                }}
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-primary hover:text-primary transition-all"
              >
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
                  onClick={onDownloadBackup}
                  className="w-full bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Baixar Backup Agora
                </button>

                <div className="mt-4">
                  <input
                    type="file"
                    id="import-backup"
                    accept=".json"
                    onChange={onImportBackup}
                    className="hidden"
                  />
                  <label
                    htmlFor="import-backup"
                    className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Importar Backup (JSON)
                  </label>
                </div>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-[#101c22] rounded-[2rem] border-2 border-slate-100 dark:border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center opacity-60">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
                </div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-2">Segurança Máxima</h4>
                <p className="text-[10px] font-bold text-slate-400 max-w-[200px]">Seus dados são sincronizados automaticamente em tempo real com a nuvem.</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default SettingsView;
