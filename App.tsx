import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import ManualOrderModal from './components/ManualOrderModal';
import ProductModal from './components/ProductModal';
import DashboardView from './views/Dashboard';
import SettingsView from './views/Settings';
import OrderDetailView from './views/OrderDetail';
import DriverDashboardView from './views/DriverDashboard';
import PlaceholderView from './views/PlaceholderView';
import DriverSelectionView from './views/DriverSelection';
import OrdersListView from './views/OrdersListView';
import DriversListView from './views/DriversListView';
import ClientsListView from './views/ClientsListView';
import UsersListView from './views/UsersListView';
import AuthView from './views/AuthView';
import WhatsAppView from './views/WhatsAppView';
import InventoryView from './views/InventoryView';
import FinancialView from './views/FinancialView';
import LiveMapView from './views/LiveMapView';
import SuperAdminView from './views/SuperAdminView';
import { Driver, View, Order, OrderStatus, Customer, AdminUser, AccessLog, AuthSession, Product, WhatsAppNumber, AutoMessage, ChatMessage, BackupConfig, Tenant, FinancialTransaction, Comodato } from './types';
import CallerIDSimulation from './components/CallerIDSimulation';

const DEFAULT_TENANT_ID = 't1';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', tenantId: DEFAULT_TENANT_ID, name: 'Gás P13', price: 120, costPrice: 85, stock: 50, stockEmpty: 10, stockDamaged: 2, minStock: 10, category: 'Gás', icon: 'propane_tank' },
  { id: 'p2', tenantId: DEFAULT_TENANT_ID, name: 'Água 20L', price: 20, costPrice: 8, stock: 100, stockEmpty: 20, stockDamaged: 5, minStock: 20, category: 'Gás', icon: 'water_drop' },
];

const INITIAL_DRIVERS: Driver[] = [];

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'a1',
    tenantId: 't1',
    name: 'Roberto Admin',
    login: 'admin',
    password: '123',
    email: 'admin@gas.com',
    role: 'admin',
    avatar: 'https://picsum.photos/seed/admin/40/40'
  }
];

const INITIAL_CUSTOMERS: Customer[] = [];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_AUTO_MESSAGES: AutoMessage[] = [
  { id: 'saudacao', text: 'Olá! Bem-vindo ao Gás & Água Express. Como podemos te ajudar hoje?' },
  { id: 'cadastro', text: 'Identificamos que você ainda não tem cadastro. Pode nos informar seu nome completo e endereço?' },
  { id: 'pedido', text: 'Qual seria o seu pedido hoje? Temos Gás P13 e Água 20L disponível.' },
  { id: 'pagamento', text: 'Como você prefere pagar? Aceitamos Pix, Dinheiro, Cartão e Carteira.' },
  { id: 'endereco', text: 'Pode confirmar se o endereço de entrega continua o mesmo?' },
  { id: 'finalizacao', text: 'Perfeito! Seu pedido foi registrado. Vou te avisar por aqui assim que o entregador sair para a rota.' },
  { id: 'rota', text: 'Ótimas notícias! Seu pedido já está com nosso entregador e a caminho do seu endereço.' },
];

const INITIAL_WA_NUMBERS: WhatsAppNumber[] = [
  { id: 'wa1', number: '(11) 98765-4321', label: 'Escritório Central', status: 'active' },
  { id: 'wa2', number: '(11) 91111-2222', label: 'Suporte & SAC', status: 'active' },
];

const OFFICIAL_OFFICE_NUMBER = '(11) 98765-4321';

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('gas-session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Erro ao carregar sessão:', e);
      return null;
    }
  });
  const [isProductionMode, setIsProductionMode] = useState(true);
  const [currentView, setCurrentView] = useState<View>(() => (localStorage.getItem('gas-currentview') as View) || 'dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem('gas-orders') || '[]'));
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const raw = JSON.parse(localStorage.getItem('gas-customers') || '[]');
    return raw.map((c: any) => ({
      ...c,
      loyaltyPoints: c.loyaltyPoints || 0,
      comodatos: c.comodatos || [],
      isRecurring: c.isRecurring || false
    }));
  });
  const [drivers, setDrivers] = useState<Driver[]>(() => JSON.parse(localStorage.getItem('gas-drivers') || '[]'));
  const [admins, setAdmins] = useState<AdminUser[]>(() => JSON.parse(localStorage.getItem('gas-admins') || JSON.stringify(INITIAL_ADMINS)));
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => JSON.parse(localStorage.getItem('gas-logs') || '[]'));
  const [activeDriverId, setActiveDriverId] = useState<string | null>(() => localStorage.getItem('gas-activedriverid'));
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() => {
    const raw = JSON.parse(localStorage.getItem('gas-products') || JSON.stringify(INITIAL_PRODUCTS));
    return raw.map((p: any) => ({
      ...p,
      stockEmpty: p.stockEmpty || 0,
      stockDamaged: p.stockDamaged || 0
    }));
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gas-darkmode') === 'true');
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('gas-theme-color') || '#13a4ec');
  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>(() => JSON.parse(localStorage.getItem('gas-automessages') || JSON.stringify(INITIAL_AUTO_MESSAGES)));
  const [waNumbers, setWaNumbers] = useState<WhatsAppNumber[]>(() => JSON.parse(localStorage.getItem('gas-wanumbers') || JSON.stringify(INITIAL_WA_NUMBERS)));
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => JSON.parse(localStorage.getItem('gas-chats') || '[]'));
  const [backupConfig, setBackupConfig] = useState<BackupConfig>(() => JSON.parse(localStorage.getItem('gas-backup') || '{"googleDriveConnected":false}'));
  const [pixKey, setPixKey] = useState(() => localStorage.getItem('gas-pix-key') || 'seu-pix@empresa.com');
  const [financeTransactions, setFinanceTransactions] = useState<FinancialTransaction[]>(() => JSON.parse(localStorage.getItem('gas-finance') || '[]'));
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('gas-tenants');
    if (saved) return JSON.parse(saved);
    return [{ id: 't1', name: 'Gás & Água Express LTDA', plan: 'Pro', status: 'Ativo', adminLogin: 'admin', adminPassword: '123' }];
  });
  const [globalLogo, setGlobalLogo] = useState(() => localStorage.getItem('gas-global-logo') || null);

  // PWA & Updates
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sistema de Atualização
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  // Splash Screen State
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Modal States
  const [showManualOrderGlobal, setShowManualOrderGlobal] = useState(false);
  const [showProductModalGlobal, setShowProductModalGlobal] = useState(false);
  const [modalInitialCustomer, setModalInitialCustomer] = useState<Customer | null>(null);

  // Efeito Global de Persistência Local
  useEffect(() => {
    // Escutar mudanças na autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (sbSession) {
        // Quando logado no Supabase, atualizamos a sessão do App
        const sessionData: AuthSession = {
          user: {
            id: sbSession.user.id,
            email: sbSession.user.email || '',
            name: sbSession.user.user_metadata?.full_name || 'Operador',
            login: sbSession.user.email || '',
            role: 'admin',
            tenantId: 't1', // No futuro, buscar do admin_users via MCP/SQL
            avatar: sbSession.user.user_metadata?.avatar_url || 'https://picsum.photos/seed/admin/40/40'
          },
          type: 'admin',
          token: sbSession.access_token
        };
        setSession(sessionData);
        localStorage.setItem('gas-session', JSON.stringify(sessionData));
      } else {
        // Quando deslogado
        setSession(null);
        localStorage.removeItem('gas-session');
      }
    });

    localStorage.setItem('gas-orders', JSON.stringify(orders));
    localStorage.setItem('gas-customers', JSON.stringify(customers));
    localStorage.setItem('gas-drivers', JSON.stringify(drivers));
    localStorage.setItem('gas-admins', JSON.stringify(admins));
    localStorage.setItem('gas-logs', JSON.stringify(accessLogs));
    localStorage.setItem('gas-products', JSON.stringify(products));
    localStorage.setItem('gas-automessages', JSON.stringify(autoMessages));
    localStorage.setItem('gas-wanumbers', JSON.stringify(waNumbers));
    localStorage.setItem('gas-chats', JSON.stringify(chatHistory));
    localStorage.setItem('gas-tenants', JSON.stringify(tenants));
    localStorage.setItem('gas-pix-key', pixKey);
    localStorage.setItem('gas-currentview', currentView);
    localStorage.setItem('gas-backup', JSON.stringify(backupConfig));
    if (activeDriverId) localStorage.setItem('gas-activedriverid', activeDriverId);
    else localStorage.removeItem('gas-activedriverid');
    if (globalLogo) localStorage.setItem('gas-global-logo', globalLogo);
    localStorage.setItem('gas-theme-color', primaryColor);
    localStorage.setItem('gas-darkmode', isDarkMode.toString());
    localStorage.setItem('gas-finance', JSON.stringify(financeTransactions));

    if (isAppLoading) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsAppLoading(false), 500);
            return 100;
          }
          return prev + 1;
        });
      }, 45); // ~5 seconds (100 * 45ms + small delay)
      return () => clearInterval(interval);
    }

    if (session) {
      // Auto-save debounced para nuvem quando dados críticos mudarem
      const timer = setTimeout(() => {
        handleSaveToCloudSilent();
      }, 5000);
      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    }

    return () => subscription.unsubscribe();
  }, [orders, customers, drivers, admins, accessLogs, products, autoMessages, waNumbers, chatHistory, tenants, pixKey, currentView, activeDriverId, globalLogo, primaryColor, isDarkMode, session]);

  // Auto-login driver from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dLogin = params.get('driverLogin');
    const dPass = params.get('pass');
    const dTenant = params.get('tenant');

    if (dLogin && dPass && dTenant) {
      const user = drivers.find(d =>
        d.login === dLogin &&
        d.password === dPass &&
        d.tenantId === dTenant
      );

      if (user) {
        const newSession: AuthSession = {
          user,
          type: 'driver',
          token: 'url-auth-' + Date.now()
        };
        setSession(newSession);
        localStorage.setItem('gas-session', JSON.stringify(newSession));
        setActiveDriverId(user.id);
        setCurrentView('driver-panel');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [drivers]);

  const handleSaveToCloudSilent = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const tenantId = session.user.tenantId || DEFAULT_TENANT_ID;

      // Sincronizar Clientes
      if (customers.length > 0) {
        await supabase.from('customers').upsert(customers.map(c => ({
          id: c.id.includes('-') ? c.id : undefined, // Só envia ID se for UUID real
          tenant_id: tenantId,
          name: c.name,
          phone: c.phone,
          address: c.address,
          neighborhood: c.neighborhood,
          city: c.city,
          zip_code: c.zipCode,
          credit_limit: c.creditLimit,
          total_debts: c.total_debts
        })));
      }

      // Sincronizar Produtos
      if (products.length > 0) {
        await supabase.from('products').upsert(products.map(p => ({
          id: p.id.includes('-') ? p.id : undefined,
          tenant_id: tenantId,
          name: p.name,
          price: p.price,
          cost_price: p.costPrice || 0,
          stock: p.stock,
          min_stock: p.minStock || 0,
          category: p.category,
          icon: p.icon
        })));
      }

      // Sincronizar Pedidos
      if (orders.length > 0) {
        await supabase.from('orders').upsert(orders.map(o => ({
          id: o.id.includes('-') ? o.id : undefined,
          tenant_id: tenantId,
          customer_name: o.customerName,
          phone: o.phone,
          address: o.address,
          neighborhood: o.neighborhood,
          city: o.city,
          items: o.items,
          total: o.total,
          payment_method: o.paymentMethod,
          status: o.status,
          date: o.date
        })));
      }
      // Pequeno delay para o usuário ver o indicador de salvamento
      setTimeout(() => setIsSaving(false), 2000);
      console.log('☁️ Nuvem sincronizada silenciosamente.');
    } catch (e) {
      console.error('Erro no auto-save cloud:', e);
      setIsSaving(false);
    }
  };

  // Carregar dados da nuvem ao iniciar
  const loadDataFromCloud = async () => {
    if (!session) return;
    setIsSyncing(true);
    try {
      const tenantId = session.user.tenantId || DEFAULT_TENANT_ID;

      // 1. Carregar Clientes
      const { data: cData, error: cErr } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', tenantId);
      if (cErr) throw cErr;
      if (cData) {
        const mappedCustomers: Customer[] = cData.map(c => ({
          id: c.id,
          tenantId: c.tenant_id,
          name: c.name,
          phone: c.phone,
          zipCode: c.zip_code || '',
          street: '',
          number: '',
          address: c.address,
          neighborhood: c.neighborhood,
          city: c.city,
          avatar: c.avatar_url || `https://i.pravatar.cc/150?u=${c.name}`,
          orderHistory: [],
          creditLimit: Number(c.credit_limit),
          totalDebts: Number(c.total_debts),
          loyaltyPoints: Number(c.loyalty_points || 0),
          comodatos: (c.comodatos as any) || [],
          isRecurring: !!c.is_recurring
        }));
        setCustomers(mappedCustomers);
      }

      // 2. Carregar Produtos
      const { data: pData, error: pErr } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId);
      if (pErr) throw pErr;
      if (pData) {
        const mappedProducts: Product[] = pData.map(p => ({
          id: p.id,
          tenantId: p.tenant_id,
          name: p.name,
          price: Number(p.price),
          costPrice: Number(p.cost_price),
          stock: p.stock,
          stockEmpty: p.stock_empty || 0,
          stockDamaged: p.stock_damaged || 0,
          minStock: p.min_stock,
          category: p.category as any,
          icon: p.icon
        }));
        setProducts(mappedProducts);
      }

      // 3. Carregar Pedidos
      const { data: oData, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (oErr) throw oErr;
      if (oData) {
        const mappedOrders: Order[] = oData.map(o => ({
          id: o.id,
          tenantId: o.tenant_id,
          customerName: o.customer_name,
          phone: o.phone,
          zipCode: '',
          street: '',
          number: '',
          neighborhood: o.neighborhood,
          city: o.city,
          address: o.address,
          items: o.items as any,
          timestamp: o.created_at,
          date: o.date,
          status: o.status as OrderStatus,
          total: Number(o.total),
          paymentMethod: o.payment_method as any,
          deliveryType: 'Entrega',
          avatar: `https://i.pravatar.cc/150?u=${o.customer_name}`,
          waitTime: '0 min'
        }));
        setOrders(mappedOrders);
      }

      console.log('✅ Dados carregados do cloud com sucesso.');
    } catch (err) {
      console.error('Erro ao carregar do cloud:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadDataFromCloud();
    }
  }, [session?.user?.id]);

  const getGeocode = async (address: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
        headers: { 'User-Agent': 'GasAguaExpress/1.0' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error('Geocoding error:', e);
    }
    // Fallback: Random point in São Paulo
    return {
      lat: -23.5505 + (Math.random() - 0.5) * 0.1,
      lng: -46.6333 + (Math.random() - 0.5) * 0.1
    };
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSaveToCloud = async () => {
    if (!session) return;
    setIsSyncing(true);
    try {
      // 1. Exportar Backup JSON localmente também (como solicitado)
      const fullBackupData = {
        tenants,
        products,
        customers,
        orders,
        drivers,
        admins,
        autoMessages,
        waNumbers,
        chatHistory,
        backupConfig,
        pixKey,
        accessLogs,
        globalLogo,
        primaryColor,
        version: '2.13.0',
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(fullBackupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_express_cloud_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      // 2. Sincronizar com Supabase (Nuvem)
      // 1. Sincronizar Tenants
      if (tenants.length > 0) {
        const { error: tErr } = await supabase.from('tenants').upsert(tenants.map(t => ({
          id: t.id,
          name: t.name,
          plan: (t.plan as string || 'free').toLowerCase()
        })));
        if (tErr) throw tErr;
      }

      // 2. Sincronizar Produtos
      if (products.length > 0) {
        const { error: pErr } = await supabase.from('products').upsert(products.map(p => ({
          id: p.id,
          tenant_id: p.tenantId || DEFAULT_TENANT_ID,
          name: p.name,
          price: p.price,
          cost_price: p.costPrice || 0,
          stock: p.stock,
          min_stock: p.minStock || 0,
          category: p.category,
          icon: p.icon
        })));
        if (pErr) throw pErr;
      }

      // 3. Sincronizar Clientes
      if (customers.length > 0) {
        const { error: cErr } = await supabase.from('customers').upsert(customers.map(c => ({
          id: c.id.length > 10 ? c.id : undefined, // Evitar IDs fake curtos que quebrem UUID se o DB for restrito
          tenant_id: c.tenantId || DEFAULT_TENANT_ID,
          name: c.name,
          phone: c.phone,
          email: '', // Campo opcional no DB
          address: c.address,
          neighborhood: c.neighborhood,
          city: c.city,
          zip_code: c.zipCode,
          avatar_url: c.avatar,
          credit_limit: c.creditLimit,
          total_debts: c.totalDebts
        })));
        if (cErr) throw cErr;
      }

      // 4. Sincronizar Pedidos
      if (orders.length > 0) {
        const { error: oErr } = await supabase.from('orders').upsert(orders.map(o => ({
          id: o.id.startsWith('#') ? o.id : o.id, // Mantendo ID como string texto conforme migração
          tenant_id: o.tenantId || DEFAULT_TENANT_ID,
          customer_name: o.customerName,
          phone: o.phone,
          address: o.address,
          neighborhood: o.neighborhood,
          city: o.city,
          items: o.items,
          total: o.total,
          payment_method: o.paymentMethod,
          status: o.status,
          notes: o.notes,
          date: o.date
        })));
        if (oErr) throw oErr;
      }

      alert('🚀 Sucesso! Todos os dados foram salvos na Nuvem e um arquivo de segurança foi baixado.');
    } catch (err: any) {
      console.error('Erro ao salvar na nuvem:', err);
      alert('❌ Erro na sincronização: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadBackup = () => {
    const data = {
      orders,
      customers,
      drivers,
      admins,
      products,
      tenants,
      autoMessages,
      waNumbers,
      chatHistory,
      backupConfig,
      pixKey,
      accessLogs,
      globalLogo,
      primaryColor,
      financeTransactions,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_completo_gas_agua_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.tenants) setTenants(data.tenants);
          if (data.products) setProducts(data.products);
          if (data.customers) setCustomers(data.customers);
          if (data.orders) setOrders(data.orders);
          if (data.drivers) setDrivers(data.drivers);
          if (data.admins) setAdmins(data.admins);
          if (data.autoMessages) setAutoMessages(data.autoMessages);
          if (data.waNumbers) setWaNumbers(data.waNumbers);
          if (data.chatHistory) setChatHistory(data.chatHistory);
          if (data.backupConfig) setBackupConfig(data.backupConfig);
          if (data.pixKey) setPixKey(data.pixKey);
          if (data.accessLogs) setAccessLogs(data.accessLogs);
          if (data.globalLogo) setGlobalLogo(data.globalLogo);
          if (data.primaryColor) setPrimaryColor(data.primaryColor);

          alert('📥 Backup importado com sucesso!');
        } catch (err) {
          alert('❌ Erro ao ler arquivo de backup: ' + err);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
    setCurrentView('order-detail');
    setIsMenuOpen(false); // Fecha menu ao mudar view no mobile
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    const hoverColor = primaryColor + 'cc';
    document.documentElement.style.setProperty('--primary-hover', hoverColor);
  }, [primaryColor]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('gas-darkmode', String(isDarkMode));
  }, [isDarkMode]);

  // Sync state to LocalStorage (Pseudo-DB for now)
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('gas-orders', JSON.stringify(orders));
    localStorage.setItem('gas-customers', JSON.stringify(customers));
    localStorage.setItem('gas-drivers', JSON.stringify(drivers));
    localStorage.setItem('gas-admins', JSON.stringify(admins));
    localStorage.setItem('gas-products', JSON.stringify(products));
    localStorage.setItem('gas-theme-color', primaryColor);
    localStorage.setItem('gas-automessages', JSON.stringify(autoMessages));
    localStorage.setItem('gas-wanumbers', JSON.stringify(waNumbers));
    localStorage.setItem('gas-chats', JSON.stringify(chatHistory));
    localStorage.setItem('gas-backup', JSON.stringify(backupConfig));
    localStorage.setItem('gas-pix-key', pixKey);
    localStorage.setItem('gas-logs', JSON.stringify(accessLogs));
    localStorage.setItem('gas-tenants', JSON.stringify(tenants));
    if (globalLogo) localStorage.setItem('gas-global-logo', globalLogo);

    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [orders, customers, drivers, admins, products, primaryColor, autoMessages, waNumbers, chatHistory, backupConfig, pixKey, accessLogs, tenants, globalLogo]);

  // Bloqueio de visão para entregadores
  useEffect(() => {
    if (session?.type === 'driver' && currentView !== 'driver-panel') {
      setCurrentView('driver-panel');
    }
  }, [session, currentView]);

  // Capturar evento de instalação
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Se já estiver logado e for mobile, mostra o modal
      if (session && window.innerWidth < 1024 && !localStorage.getItem('pwa-dismissed')) {
        setShowInstallModal(true);
      }
    };

    const updateHandler = () => {
      setShowUpdateAlert(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('pwa-update-available', updateHandler);

    // Verificação agressiva de atualização (A cada 30 segundos)
    const updateCheckInterval = setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg) {
            reg.update(); // Força a verificação no servidor
          }
        });
      }
    }, 30000);

    const onStateChange = (newWorker: any) => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          setShowUpdateAlert(true);
        }
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) newWorker.addEventListener('statechange', () => onStateChange(newWorker));
          });
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-update-available', updateHandler);
      clearInterval(updateCheckInterval);
    };
  }, [session]);

  // Simulação de Rastreamento em Tempo Real
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prevDrivers => prevDrivers.map(d => {
        // Se o motorista está ocupado e tem um pedido em rota
        const activeOrder = orders.find(o => o.driver === d.name && o.status === OrderStatus.ON_ROUTE);

        if (activeOrder && activeOrder.lat && activeOrder.lng) {
          const currentLat = d.lat || -23.5505;
          const currentLng = d.lng || -46.6333;

          // Movimento suave em direção ao destino (0.001 deg ~ 100m)
          const step = 0.0005;
          const dLat = activeOrder.lat - currentLat;
          const dLng = activeOrder.lng - currentLng;

          const newLat = Math.abs(dLat) < step ? activeOrder.lat : currentLat + (dLat > 0 ? step : -step);
          const newLng = Math.abs(dLng) < step ? activeOrder.lng : currentLng + (dLng > 0 ? step : -step);

          return { ...d, lat: newLat, lng: newLng };
        }

        // Se não tiver lat/lng inicial, define um
        if (!d.lat || !d.lng) {
          return {
            ...d,
            lat: d.lat || -23.5505 + (Math.random() - 0.5) * 0.05,
            lng: d.lng || -46.6333 + (Math.random() - 0.5) * 0.05
          };
        }

        return d;
      }));
    }, 3000); // Atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, [orders]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallModal(false);
  };

  const handleSystemUpdate = () => {
    setIsUpdating(true);
    let progress = 0;
    const duration = 7000; // 7 segundos cravados para o usuário
    const intervalTime = 100;
    const increment = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      progress += increment;
      setUpdateProgress(Math.min(progress, 100));

      if (progress >= 100) {
        clearInterval(interval);
        // Limpeza profunda de caches e ativação da nova versão
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
              registration.unregister();
            }
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }
    }, intervalTime);
  };

  const handleAddOrder = async (newOrder: Order) => {
    // 1. Obter Localização do Pedido (Automático)
    const location = await getGeocode(newOrder.address);

    // 2. Encontrar Entregador mais Próximo (Disponível)
    let assignedDriver = '';
    const availableDrivers = drivers.filter(d => d.status === 'available');

    if (availableDrivers.length > 0 && location) {
      let minDistance = Infinity;
      let nearestDriverId = '';

      availableDrivers.forEach(d => {
        // Se o entregador não tiver lat/lng, atribui uma randômica inicial
        const dLat = d.lat || (-23.5505 + (Math.random() - 0.5) * 0.1);
        const dLng = d.lng || (-46.6333 + (Math.random() - 0.5) * 0.1);

        const dist = calculateDistance(location.lat, location.lng, dLat, dLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestDriverId = d.id;
        }
      });

      const found = drivers.find(d => d.id === nearestDriverId);
      if (found) {
        assignedDriver = found.name;
        // Atualiza status do entregador para avisar que tem pedido
        setDrivers(prev => prev.map(d => d.id === nearestDriverId ? { ...d, status: 'busy' as any } : d));
      }
    }

    const orderWithTenant = {
      ...newOrder,
      lat: location.lat,
      lng: location.lng,
      driver: assignedDriver,
      tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID
    };
    const updatedOrders = [orderWithTenant, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('gas-orders', JSON.stringify(updatedOrders));

    const customerExists = customers.some(c => c.name === newOrder.customerName);
    if (!customerExists) {
      const newCustomer: Customer = {
        id: 'c' + Math.random().toString(36).substr(2, 9),
        tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID,
        name: newOrder.customerName,
        phone: newOrder.phone || 'N/A',
        zipCode: newOrder.zipCode || '',
        street: newOrder.street || '',
        number: newOrder.number || '',
        address: newOrder.address,
        neighborhood: newOrder.neighborhood,
        city: newOrder.city || 'São Paulo',
        avatar: `https://i.pravatar.cc/150?u=${newOrder.customerName}`,
        orderHistory: [newOrder.id],
        creditLimit: 500,
        totalDebts: newOrder.paymentMethod === 'Carteira' ? newOrder.total : 0,
        loyaltyPoints: 0,
        comodatos: [],
        isRecurring: false
      };
      setCustomers([...customers, newCustomer]);
    } else {
      // Atualiza fidelidade e recorrência se o cliente já existir
      setCustomers(customers.map(c =>
        c.name === newOrder.customerName
          ? {
            ...c,
            loyaltyPoints: c.loyaltyPoints + 1,
            isRecurring: true,
            totalDebts: newOrder.paymentMethod === 'Carteira' ? c.totalDebts + newOrder.total : c.totalDebts,
            orderHistory: [...c.orderHistory, newOrder.id]
          }
          : c
      ));
    }

    const updatedProducts = products.map(p => {
      const orderItem = newOrder.items.find(item => item.name === p.name);
      if (orderItem) {
        return {
          ...p,
          stock: p.stock - orderItem.quantity,
          stockEmpty: (p.stockEmpty || 0) + orderItem.quantity
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    setCurrentView('dashboard');
  };

  const handleUpdateAdminCredentials = (login: string, pass: string) => {
    if (!session?.user?.tenantId) return;
    setTenants(prev => prev.map(t =>
      t.id === session.user.tenantId ? { ...t, adminLogin: login, adminPassword: pass } : t
    ));
    // Se quiser atualizar na hora o usuário logado (opcional no mock)
    // alert('Credenciais administrativas atualizadas com sucesso!');
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    const oldOrder = orders.find(o => o.id === updatedOrder.id);

    // Se o pedido foi cancelado, devolve os itens ao estoque (Vazio -> Cheio)
    if (oldOrder && oldOrder.status !== OrderStatus.CANCELLED && updatedOrder.status === OrderStatus.CANCELLED) {
      const updatedProducts = products.map(p => {
        const item = updatedOrder.items.find(i => i.name === p.name);
        if (item) {
          return {
            ...p,
            stock: p.stock + item.quantity,
            stockEmpty: Math.max(0, (p.stockEmpty || 0) - item.quantity)
          };
        }
        return p;
      });
      setProducts(updatedProducts);
    }

    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleLogin = (credentials: { login: string; pass: string; type: 'admin' | 'driver' | 'creator'; tenantId?: string }) => {
    if (credentials.type === 'creator') {
      const newSession: AuthSession = {
        user: { id: 'creator', name: 'Administrador Mestre', login: 'creator', tenantId: 'master', email: 'owner@system.com', role: 'admin', avatar: '' },
        type: 'admin',
        token: 'master-token'
      };
      setSession(newSession);
      localStorage.setItem('gas-session', JSON.stringify(newSession));
      setCurrentView('super-admin');
      return;
    }

    if (credentials.type === 'admin') {
      // 1. Verificar se o Tenant existe e está Ativo
      const targetTenant = tenants.find(t => t.id === credentials.tenantId);
      if (targetTenant && targetTenant.status === 'Bloqueado') {
        alert('Esta empresa está com o acesso bloqueado. Entre em contato com o suporte.');
        return;
      }

      // 2. Se for o Admin principal do Tenant (gerado pelo Criador)
      if (targetTenant && credentials.login === targetTenant.adminLogin && credentials.pass === targetTenant.adminPassword) {
        const newSession: AuthSession = {
          user: { id: 'admin-' + targetTenant.id, name: 'Admin ' + targetTenant.name, login: targetTenant.adminLogin, tenantId: targetTenant.id, email: '', role: 'admin', avatar: '' },
          type: 'admin',
          token: 'token-' + targetTenant.id
        };
        setSession(newSession);
        localStorage.setItem('gas-session', JSON.stringify(newSession));
        setCurrentView('dashboard');
        return;
      }

      // 3. Fallback para admins secundários
      const user = admins.find(a =>
        a.login === credentials.login &&
        a.password === credentials.pass &&
        (credentials.tenantId ? a.tenantId === credentials.tenantId : true)
      );
      if (user) {
        const newSession: AuthSession = { user, type: 'admin', token: 'mock-token-admin' };
        setSession(newSession);
        localStorage.setItem('gas-session', JSON.stringify(newSession));
        // ... (rest of log logic)
        const log: AccessLog = {
          id: 'l' + Date.now(),
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          type: 'login',
          date: new Date().toLocaleDateString(),
          timestamp: new Date().toLocaleTimeString().slice(0, 5)
        };
        setAccessLogs([...accessLogs, log]);

        setCurrentView('dashboard');
      } else {
        alert('Credenciais administrativas inválidas');
      }
    } else {
      const user = drivers.find(d => d.login === credentials.login && d.password === credentials.pass);
      if (user) {
        const newSession: AuthSession = { user, type: 'driver', token: 'mock-token-driver-' + user.id };
        setSession(newSession);
        localStorage.setItem('gas-session', JSON.stringify(newSession));
        setActiveDriverId(user.id);
        setCurrentView('driver-panel');
      } else {
        alert('Credenciais de entregador inválidas');
      }
    }
  };

  const handleLogout = () => {
    if (session && session.type === 'admin') {
      const user = session.user as AdminUser;
      const log: AccessLog = {
        id: 'l' + Date.now(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        type: 'logout',
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleTimeString().slice(0, 5)
      };
      setAccessLogs([...accessLogs, log]);
    }
    setSession(null);
    localStorage.removeItem('gas-session');
    setActiveDriverId(null);
    setCurrentView('dashboard');
  };

  const handleAddAdmin = (newUser: AdminUser) => {
    const adminWithTenant = {
      ...newUser,
      tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID
    };
    setAdmins([...admins, adminWithTenant]);
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter(a => a.id !== id));
  };

  const handleAddDriver = (newDriver: Driver) => {
    const driverWithTenant = {
      ...newDriver,
      tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID
    };
    setDrivers([...drivers, driverWithTenant]);
  };

  const handleDeleteDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id));
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    setDrivers(drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  };

  // Filtros de Tennant (SaaS)
  const filteredOrders = orders.filter(o => o.tenantId === session?.user?.tenantId);
  const filteredCustomers = customers.filter(c => c.tenantId === session?.user?.tenantId);
  const filteredDrivers = drivers.filter(d => d.tenantId === session?.user?.tenantId);
  const filteredProducts = products.filter(p => p.tenantId === session?.user?.tenantId);
  const filteredAdmins = admins.filter(a => a.tenantId === session?.user?.tenantId);


  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            orders={filteredOrders}
            customers={filteredCustomers}
            onSelectOrder={handleSelectOrder}
            onAddOrder={handleAddOrder}
            products={filteredProducts}
            onAddProduct={(p) => {
              const productWithTenant = { ...p, tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID };
              setProducts([...products, productWithTenant]);
            }}
            pixKey={pixKey}
            onOpenManualOrder={() => setShowManualOrderGlobal(true)}
            onOpenProductModal={() => setShowProductModalGlobal(true)}
          />
        );
      case 'orders':
        return (
          <OrdersListView
            orders={filteredOrders}
            onSelectOrder={handleSelectOrder}
          />
        );
      case 'settings':
        return (
          <SettingsView
            primaryColor={primaryColor}
            onColorChange={setPrimaryColor}
            autoMessages={autoMessages}
            onUpdateAutoMessages={setAutoMessages}
            waNumbers={waNumbers}
            onUpdateWaNumbers={setWaNumbers}
            backupConfig={backupConfig}
            onUpdateBackup={setBackupConfig}
            pixKey={pixKey}
            onUpdatePix={setPixKey}
            adminLogin={tenants.find(t => t.id === session?.user?.tenantId)?.adminLogin || 'admin'}
            adminPassword={tenants.find(t => t.id === session?.user?.tenantId)?.adminPassword || ''}
            onUpdateAdminCredentials={handleUpdateAdminCredentials}
            onImportBackup={handleImportBackup}
            onDownloadBackup={handleDownloadBackup}
            onUpdateLogo={setGlobalLogo}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppView
            waNumbers={waNumbers}
            autoMessages={autoMessages}
            chatHistory={chatHistory}
            onAddChatMessage={(msg) => setChatHistory([...chatHistory, msg])}
            customers={filteredCustomers}
          />
        );
      case 'order-detail':
        return selectedOrder ? (
          <OrderDetailView
            order={selectedOrder}
            onBack={() => setCurrentView('dashboard')}
            onUpdateOrder={handleUpdateOrder}
            pixKey={pixKey}
          />
        ) : (
          <DashboardView
            orders={filteredOrders}
            customers={filteredCustomers}
            onSelectOrder={handleSelectOrder}
            onAddOrder={handleAddOrder}
            products={filteredProducts}
            onAddProduct={(p) => {
              const productWithTenant = { ...p, tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID };
              setProducts([...products, productWithTenant]);
            }}
          />
        );
      case 'driver-panel':
        // No painel do entregador, o admin tem acesso a todos os entregadores (seletor)
        // O entregador logado vai direto para o dashboard dele
        if (session?.type === 'driver') {
          const activeDriver = filteredDrivers.find(d => d.id === session.user.id)!;
          return (
            <DriverDashboardView
              orders={filteredOrders}
              onUpdateOrder={handleUpdateOrder}
              driver={activeDriver}
              onEndShift={handleLogout}
            />
          );
        }

        // Se for Admin acessando o painel de entregadores
        if (!activeDriverId) {
          return (
            <DriverSelectionView
              drivers={filteredDrivers}
              onSelectDriver={(id) => setActiveDriverId(id)}
              onBack={() => setCurrentView('dashboard')}
            />
          );
        }
        const selectedDriver = filteredDrivers.find(d => d.id === activeDriverId)!;
        return (
          <DriverDashboardView
            orders={filteredOrders}
            onUpdateOrder={handleUpdateOrder}
            driver={selectedDriver}
            onEndShift={() => setActiveDriverId(null)}
          />
        );
      case 'drivers':
        return (
          <DriversListView
            drivers={filteredDrivers}
            onAddDriver={handleAddDriver}
            onDeleteDriver={handleDeleteDriver}
            onUpdateDriver={handleUpdateDriver}
            currentTenantId={session?.user?.tenantId || DEFAULT_TENANT_ID}
          />
        );
      case 'map':
        return <LiveMapView drivers={filteredDrivers} orders={filteredOrders} />;
      case 'clients':
        return <ClientsListView customers={filteredCustomers} orders={filteredOrders} />;
      case 'users':
        return (
          <UsersListView
            users={filteredAdmins}
            accessLogs={accessLogs}
            onAddUser={handleAddAdmin}
            onDeleteUser={handleDeleteAdmin}
            isAdmin={(session?.user as AdminUser)?.role === 'admin'}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            products={filteredProducts}
            onUpdateProduct={(updated) => setProducts(products.map(p => p.id === updated.id ? updated : p))}
            onOpenProductModal={() => setShowProductModalGlobal(true)}
          />
        );
      case 'financial':
        return (
          <FinancialView
            orders={filteredOrders}
            products={filteredProducts}
            transactions={financeTransactions}
            onAddTransaction={(t) => setFinanceTransactions([...financeTransactions, { ...t, tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID }])}
            onUpdateTransaction={(updated) => setFinanceTransactions(financeTransactions.map(t => t.id === updated.id ? updated : t))}
          />
        );
      case 'super-admin':
        return (
          <SuperAdminView
            tenants={tenants}
            onAddTenant={(t) => setTenants([...tenants, t])}
            onUpdateTenant={(t) => setTenants(tenants.map(item => item.id === t.id ? t : item))}
            onDeleteTenant={(id) => setTenants(tenants.filter(t => t.id !== id))}
            stats={{
              totalOrdersCount: orders.length,
              activeDriversCount: drivers.filter(d => d.status === 'available').length
            }}
            onLogout={handleLogout}
            globalLogo={globalLogo}
            onUpdateGlobalLogo={setGlobalLogo}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <span className="material-symbols-outlined text-6xl mb-4">construction</span>
            <h2 className="text-2xl font-bold">Página em Desenvolvimento</h2>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              Voltar ao Dashboard
            </button>
          </div>
        );
    }
  };

  const renderAuth = () => {
    return (
      <AuthView
        onLoginSuccess={(newSession) => {
          const sessionData: AuthSession = {
            user: {
              id: newSession.user.id,
              email: newSession.user.email || '',
              name: newSession.user.user_metadata?.full_name || 'Operador',
              login: newSession.user.email || '',
              role: 'admin',
              tenantId: 't1',
              avatar: newSession.user.user_metadata?.avatar_url || 'https://picsum.photos/seed/admin/40/40'
            },
            type: 'admin',
            token: newSession.access_token
          };
          setSession(sessionData);
          localStorage.setItem('gas-session', JSON.stringify(sessionData));
        }}
        globalLogo={globalLogo}
      />
    );
  };

  if (!session) {
    return renderAuth();
  }

  return (
    <div className="app-container overflow-hidden relative">
      {/* Botão Hambúrguer para Mobile */}
      {session.type === 'admin' && (
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 size-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      )}

      {/* Sidebar - Agora com suporte a Mobile flutuante */}
      {session.type === 'admin' && currentView !== 'super-admin' && (
        <>
          {/* Overlay para fechar menu ao clicar fora no mobile */}
          {isMenuOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          <div className={`
            fixed lg:static inset-y-0 left-0 z-40 transform 
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 transition-transform duration-300 ease-in-out
          `}>
            <Sidebar
              currentView={currentView}
              setView={setCurrentView}
              toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              isDarkMode={isDarkMode}
              onLogout={handleLogout}
              userName={session.user.name}
              userRole={session.type === 'admin' ? (session.user as AdminUser).role : 'driver'}
              pendingOrdersCount={filteredOrders.filter(o => o.status === OrderStatus.PENDING).length}
              onInstallApp={handleInstallApp}
              showInstallButton={!!deferredPrompt}
              globalLogo={globalLogo}
              onSaveToDatabase={handleSaveToCloud}
              isSyncing={isSyncing}
              onOpenManualOrder={() => setShowManualOrderGlobal(true)}
            />
          </div>
        </>
      )}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col overflow-hidden relative ${session.type === 'driver' || currentView === 'driver-panel' || currentView === 'super-admin' ? 'w-full' : ''}`}>
        {renderContent()}
      </div>

      <ManualOrderModal
        isOpen={showManualOrderGlobal}
        onClose={() => setShowManualOrderGlobal(false)}
        customers={customers}
        products={products}
        onAddOrder={handleAddOrder}
        pixKey={pixKey}
        initialCustomer={modalInitialCustomer}
      />

      <ProductModal
        isOpen={showProductModalGlobal}
        onClose={() => setShowProductModalGlobal(false)}
        onAddProduct={(p) => setProducts([...products, p])}
      />

      {isAppLoading && (
        <div className="fixed inset-0 z-[1000] bg-slate-900 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] size-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] size-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
          </div>

          <div className="z-10 flex flex-col items-center max-w-sm w-full">
            <div className="size-24 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
              <span className="material-symbols-outlined text-primary text-5xl icon-fill animate-bounce">local_fire_department</span>
            </div>

            <h1 className="text-white text-3xl font-black uppercase tracking-tighter mb-2 italic">Gás & Água Express</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Carregando Ecossistema...</p>

            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_rgba(19,164,236,0.5)]"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>

            <div className="mt-4 flex justify-between w-full">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Iniciando Sistema</span>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">{loadingProgress}%</span>
            </div>
          </div>

          <div className="absolute bottom-12 text-center z-10">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Versão 3.1.0 • Agência Bredi</p>
          </div>
        </div>
      )}

      {showUpdateAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-md animate-in slide-in-from-top-10 duration-700">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-[2rem] shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${isUpdating ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <span className={`material-symbols-outlined text-primary text-2xl ${isUpdating ? 'animate-spin' : 'animate-bounce'}`}>
                    {isUpdating ? 'sync' : 'system_update'}
                  </span>
                </div>
                <div>
                  <h4 className="text-white text-sm font-black uppercase tracking-tight">
                    {isUpdating ? 'Atualizando Sistema...' : 'Nova versão disponível!'}
                  </h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    {isUpdating ? `Processando melhorias (${updateProgress}%)` : 'O sistema foi atualizado com melhorias.'}
                  </p>
                </div>
              </div>

              {!isUpdating && (
                <button
                  onClick={handleSystemUpdate}
                  className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 border border-white/10"
                >
                  Atualizar Agora
                </button>
              )}
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full bg-primary transition-all duration-300 ease-out ${isUpdating ? 'opacity-100' : 'opacity-0'}`}
                style={{ width: `${updateProgress}%` }}
              ></div>
            </div>

            {isUpdating && (
              <div className="absolute bottom-0 left-0 h-1 bg-primary/30 blur-sm animate-pulse" style={{ width: '100%' }}></div>
            )}
          </div>
        </div>
      )}

      {session?.user.role === 'admin' && (
        <CallerIDSimulation
          customers={customers}
          onNewOrder={(customer) => {
            setModalInitialCustomer(customer);
            setShowManualOrderGlobal(true);
          }}
        />
      )}
    </div>
  );
};

export default App;

