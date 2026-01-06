
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Order, Driver, OrderStatus, AuthSession } from './types';
import DriverDashboardView from './views/DriverDashboard';
import './index.css';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

const App: React.FC = () => {
    const [session, setSession] = useState<AuthSession | null>(() => {
        const saved = localStorage.getItem('gas-driver-session');
        return saved ? JSON.parse(saved) : null;
    });
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeDriver, setActiveDriver] = useState<Driver | null>(null);

    // 1. Auto-login via Magic Link
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dLogin = params.get('driverLogin');
        const dPass = params.get('pass');
        const dTenant = params.get('tenant');

        if (dLogin && dPass) {
            const loginDriver = async () => {
                const { data, error } = await supabase
                    .from('drivers')
                    .select('*')
                    .eq('login', dLogin)
                    .eq('password', dPass)
                    .single();

                if (data && !error) {
                    const sessionData: AuthSession = {
                        user: {
                            id: data.id,
                            tenantId: dTenant || DEFAULT_TENANT_ID,
                            name: data.name,
                            login: data.login,
                            role: 'driver',
                            email: data.email || '',
                            phone: data.phone || '',
                            status: 'available',
                            avatar: data.avatar_url || '',
                            vehicle: {
                                model: '',
                                plate: '',
                                type: 'Carro',
                                currentKM: 0,
                                startShiftKM: 0,
                                endShiftKM: 0,
                                lastOilChangeKM: 0,
                                nextOilChangeKM: 0,
                                lastOilChangeDate: ''
                            }
                        } as Driver,
                        type: 'driver',
                        token: 'MAGIC_LINK'
                    };
                    setSession(sessionData);
                    localStorage.setItem('gas-driver-session', JSON.stringify(sessionData));
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            };
            loginDriver();
        }
    }, []);

    // 2. Load Data when Session is Active
    useEffect(() => {
        if (session) {
            loadDriverData();
            setupRealtime();
        }
    }, [session]);

    const loadDriverData = async () => {
        if (!session) return;
        setIsSyncing(true);
        try {
            const tId = session.user.tenantId;

            // Load Driver Info
            const { data: dData } = await supabase
                .from('drivers')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (dData) {
                setActiveDriver({
                    id: dData.id,
                    tenantId: dData.tenant_id,
                    name: dData.name,
                    login: dData.login,
                    password: dData.password,
                    phone: dData.phone || '',
                    email: dData.email || '',
                    status: dData.status as any,
                    avatar: dData.avatar_url || `https://i.pravatar.cc/150?u=${dData.name}`,
                    vehicle: {
                        model: dData.vehicle_model || '',
                        plate: dData.vehicle_plate || '',
                        type: dData.vehicle_type as any || 'Carro',
                        currentKM: dData.current_km || 0,
                        startShiftKM: 0,
                        endShiftKM: 0,
                        lastOilChangeKM: dData.last_oil_change_km || 0,
                        nextOilChangeKM: dData.next_oil_change_km || 5000,
                        lastOilChangeDate: dData.last_oil_change_date || '',
                        observations: ''
                    }
                });
            }

            // Load Orders for this driver
            const { data: oData } = await supabase
                .from('orders')
                .select('*')
                .eq('driver', session.user.name)
                .order('created_at', { ascending: false });

            if (oData) {
                setOrders(oData.map(o => ({
                    id: o.id,
                    tenantId: o.tenant_id,
                    customerName: o.customer_name,
                    phone: o.phone,
                    address: o.address,
                    neighborhood: o.neighborhood,
                    city: o.city,
                    items: o.items as any,
                    timestamp: o.created_at,
                    date: o.date,
                    status: o.status as OrderStatus,
                    total: Number(o.total),
                    paymentMethod: o.payment_method as any,
                    deliveryType: 'Entrega',
                    driver: o.driver,
                    avatar: `https://i.pravatar.cc/150?u=${o.customer_name}`
                })));
            }
        } catch (e) {
            console.error('Error loading driver data:', e);
        } finally {
            setIsSyncing(false);
        }
    };

    const setupRealtime = () => {
        if (!session) return;
        const channel = supabase
            .channel('driver_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders', filter: `driver=eq.${session.user.name}` },
                (payload) => {
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        loadDriverData(); // Reload for simplicity in the driver app
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleUpdateOrder = async (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

        // Sync to Supabase
        await supabase.from('orders').update({
            status: updatedOrder.status
        }).eq('id', updatedOrder.id);
    };

    const handleLogout = () => {
        localStorage.removeItem('gas-driver-session');
        setSession(null);
        setActiveDriver(null);
    };

    if (!session) {
        return (
            <div className="h-screen bg-[#0b141a] flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="size-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mb-6 border border-primary/20">
                    <span className="material-symbols-outlined text-4xl">delivery_dining</span>
                </div>
                <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-2">MeuGás Entregador</h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-8">Por favor, acesse através do link enviado pelo seu administrador.</p>
                <div className="w-full max-w-xs p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                    Nenhum acesso detectado.<br />Contate o suporte se o erro persistir.
                </div>
            </div>
        );
    }

    if (!activeDriver) return <div className="h-screen bg-[#0b141a] flex items-center justify-center text-primary animate-pulse font-black italic">CARREGANDO...</div>;

    return (
        <DriverDashboardView
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            driver={activeDriver}
            onEndShift={handleLogout}
            onRefreshData={loadDriverData}
            isSyncing={isSyncing}
        />
    );
};

export default App;
