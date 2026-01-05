
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  onLogout: () => void;
  userName: string;
  userRole: string;
  pendingOrdersCount: number;
  onInstallApp?: () => void;
  showInstallButton?: boolean;
  globalLogo?: string | null;
  onSaveToDatabase?: () => void;
  isSyncing?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView, setView, toggleDarkMode, isDarkMode, onLogout,
  userName, userRole, pendingOrdersCount, onInstallApp,
  showInstallButton, globalLogo, onSaveToDatabase, isSyncing
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'orders', label: 'Pedidos', icon: 'shopping_bag', count: pendingOrdersCount },
    { id: 'drivers', label: 'Entregadores', icon: 'local_shipping' },
    { id: 'map', label: 'Mapa em Tempo Real', icon: 'map' },
    { id: 'clients', label: 'Clientes', icon: 'group' },
    { id: 'inventory', label: 'Estoque', icon: 'inventory_2' },
    { id: 'financial', label: 'Financeiro', icon: 'paid' },
    { id: 'whatsapp', label: 'WhatsApp Bot', icon: 'smart_toy' },
    { id: 'users', label: 'Colaboradores', icon: 'badge', adminOnly: true },
    { id: 'driver-panel', label: 'Painel Entregador', icon: 'two_wheeler' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#1a2c35] border-r border-[#dbe2e6] dark:border-slate-700 flex flex-col justify-between shrink-0 transition-colors duration-200 z-30">
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="p-6 pb-2">
          <div className="flex gap-3 items-center mb-6">
            {globalLogo ? (
              <img src={globalLogo} alt="Logo" className="h-10 object-contain" />
            ) : (
              <div className="bg-primary/10 rounded-full size-10 shrink-0 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined icon-fill">local_fire_department</span>
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight">Gás & Água Express</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Painel Administrativo</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto sidebar-scroll">
          {menuItems.filter(item => {
            if (userRole === 'driver') {
              return item.id === 'driver-panel';
            }
            if (item.adminOnly) {
              return userRole === 'admin';
            }
            return item.id !== 'driver-panel'; // Hide driver panel from admins/operators to keep it clean
          }).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${currentView === item.id || (item.id === 'orders' && currentView === 'dashboard')
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:scale-[1.01]'
                }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${currentView === item.id || (item.id === 'orders' && currentView === 'dashboard')
                ? 'icon-fill'
                : 'text-slate-400 group-hover:text-primary'
                }`}>
                {item.icon}
              </span>
              <span className={`text-[15px] ${currentView === item.id || (item.id === 'orders' && currentView === 'dashboard')
                ? 'font-black uppercase tracking-tight'
                : 'font-bold'
                }`}>
                {item.label}
              </span>
              {item.count && (
                <span className={`ml-auto ${currentView === item.id ? 'bg-white text-primary' : 'bg-primary text-white'} text-[10px] font-black px-2 py-0.5 rounded-full`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Settings */}
        <div className="p-3 mt-auto border-t border-[#dbe2e6] dark:border-slate-700">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors w-full"
          >
            <span className="material-symbols-outlined text-slate-400">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="text-sm font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>

          {onSaveToDatabase && (
            <button
              onClick={onSaveToDatabase}
              disabled={isSyncing}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full mt-1 ${isSyncing
                ? 'bg-primary/10 text-primary cursor-wait'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
            >
              <span className={`material-symbols-outlined font-black ${isSyncing ? 'animate-spin' : ''}`}>
                {isSyncing ? 'sync' : 'cloud_upload'}
              </span>
              <span className="text-sm font-black uppercase tracking-tight">
                {isSyncing ? 'Salvando...' : 'Salvar na Nuvem'}
              </span>
            </button>
          )}

          {showInstallButton && onInstallApp && (
            <button
              onClick={onInstallApp}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all w-full animate-bounce mt-1"
            >
              <span className="material-symbols-outlined font-black">download_for_offline</span>
              <span className="text-sm font-black uppercase tracking-tight">Instalar App</span>
            </button>
          )}

          <button
            onClick={() => setView('settings')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group w-full ${currentView === 'settings'
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
          >
            <span className={`material-symbols-outlined ${currentView === 'settings' ? 'icon-fill' : 'text-slate-400 group-hover:text-slate-600'}`}>
              settings
            </span>
            <span className="text-sm font-medium">Configurações</span>
          </button>

          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <img
              src={`https://ui-avatars.com/api/?name=${userName}&background=random`}
              className="rounded-full size-8"
              alt="User Profile"
            />
            <div className="flex-1 flex flex-col overflow-hidden text-left">
              <p className="text-slate-900 dark:text-white text-sm font-bold truncate">{userName}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-tighter truncate">
                {userRole === 'admin' ? 'Administrador' : 'Operador'}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="size-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
              title="Sair do Sistema"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
            </button>
          </div>

          <div className="mt-4 px-3 pb-2 text-center">
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">Desenvolvido por</p>
            <div className="flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[12px] text-green-500 font-black">chat</span>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400">Agência Bredi • 15 998148402</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
