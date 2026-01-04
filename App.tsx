
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
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
import LoginView from './views/LoginView';
import WhatsAppView from './views/WhatsAppView';
import InventoryView from './views/InventoryView';
import FinancialView from './views/FinancialView';
import { Driver, View, Order, OrderStatus, Customer, AdminUser, AccessLog, AuthSession, Product, WhatsAppNumber, AutoMessage, ChatMessage, BackupConfig } from './types';

const DEFAULT_TENANT_ID = 't1';

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', tenantId: DEFAULT_TENANT_ID, name: 'Gás P13', price: 120, costPrice: 85, stock: 50, minStock: 10, category: 'Gás', icon: 'propane_tank' },
  { id: 'p2', tenantId: DEFAULT_TENANT_ID, name: 'Água 20L', price: 20, costPrice: 8, stock: 100, minStock: 20, category: 'Gás', icon: 'water_drop' },
];

const INITIAL_DRIVERS: Driver[] = [];

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'a1',
    tenantId: DEFAULT_TENANT_ID,
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
  { id: 'wa1', number: '(11) 98765-4321', label: 'Escritório Central (Pedidos Reais)', status: 'active' },
  { id: 'wa2', number: '(11) 91111-2222', label: 'Suporte & SAC', status: 'active' },
];

const OFFICIAL_OFFICE_NUMBER = '(11) 98765-4321';

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isProductionMode, setIsProductionMode] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#13a4ec');
  const [autoMessages, setAutoMessages] = useState<AutoMessage[]>(INITIAL_AUTO_MESSAGES);
  const [waNumbers, setWaNumbers] = useState<WhatsAppNumber[]>(INITIAL_WA_NUMBERS);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({ googleDriveConnected: false });

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    // Calcular uma versão mais escura para o hover (simplificado: reduzindo luminosidade)
    const hoverColor = primaryColor + 'cc'; // simplificação com alpha ou um helper real
    document.documentElement.style.setProperty('--primary-hover', hoverColor);
  }, [primaryColor]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSelectOrder = (id: string) => {
    setSelectedOrderId(id);
    setCurrentView('order-detail');
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);

    // Se o cliente não existir na lista, adiciona automaticamente
    const customerExists = customers.some(c => c.name === newOrder.customerName);
    if (!customerExists) {
      const newCustomer: Customer = {
        id: 'c' + Math.random().toString(36).substr(2, 9),
        tenantId: session?.user?.tenantId || DEFAULT_TENANT_ID,
        name: newOrder.customerName,
        phone: newOrder.phone || 'N/A',
        address: newOrder.address,
        neighborhood: newOrder.neighborhood,
        city: 'São Paulo', // Cidade padrão
        avatar: `https://i.pravatar.cc/150?u=${newOrder.customerName}`,
        orderHistory: [newOrder.id],
        creditLimit: 500, // Limite padrão de R$ 500
        totalDebts: newOrder.paymentMethod === 'Carteira' ? newOrder.total : 0
      };
      setCustomers([...customers, newCustomer]);
    } else if (newOrder.paymentMethod === 'Carteira') {
      // Atualiza débitos do cliente existente se pagou via Carteira
      setCustomers(customers.map(c =>
        c.name === newOrder.customerName
          ? { ...c, totalDebts: c.totalDebts + newOrder.total, orderHistory: [...c.orderHistory, newOrder.id] }
          : c
      ));
    }

    // Baixa automática de estoque
    const updatedProducts = products.map(p => {
      const orderItem = newOrder.items.find(item => item.name === p.name);
      if (orderItem) {
        return { ...p, stock: p.stock - orderItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);

    setCurrentView('dashboard');
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleLogin = (credentials: { login: string; pass: string; type: 'admin' | 'driver' }) => {
    if (credentials.type === 'admin') {
      const user = admins.find(a => a.login === credentials.login && a.password === credentials.pass);
      if (user) {
        setSession({ user, type: 'admin', token: 'mock-token-admin' });

        // Log access
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
        setSession({ user, type: 'driver', token: 'mock-token-driver-' + user.id });
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
    setActiveDriverId(null);
    setCurrentView('dashboard');
  };

  const handleAddAdmin = (newUser: AdminUser) => {
    setAdmins([...admins, newUser]);
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter(a => a.id !== id));
  };

  const handleAddDriver = (newDriver: Driver) => {
    setDrivers([...drivers, newDriver]);
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
            onAddProduct={(p) => setProducts([...products, p])}
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
          />
        ) : (
          <DashboardView
            orders={filteredOrders}
            customers={filteredCustomers}
            onSelectOrder={handleSelectOrder}
            onAddOrder={handleAddOrder}
            products={filteredProducts}
            onAddProduct={(p) => setProducts([...products, p])}
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
          />
        );
      case 'map':
        return <PlaceholderView title="Mapa ao Vivo" icon="map" />;
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
        return <InventoryView products={filteredProducts} onUpdateProduct={(updated) => setProducts(products.map(p => p.id === updated.id ? updated : p))} />;
      case 'financial':
        return <FinancialView orders={filteredOrders} products={filteredProducts} />;
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

  if (!session) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark transition-colors duration-200">
      {/* Sidebar - Apenas para Admin */}
      {session.type === 'admin' && (
        <Sidebar
          currentView={currentView}
          setView={setCurrentView}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
          onLogout={handleLogout}
          userName={session.user.name}
          userRole={(session.user as AdminUser).role}
          pendingOrdersCount={orders.filter(o => o.status !== 'Concluído' && o.status !== 'Cancelado').length}
        />
      )}

      {/* Main Container */}
      <div className={`flex-1 flex flex-col overflow-hidden ${session.type === 'driver' || currentView === 'driver-panel' ? 'w-full' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;

