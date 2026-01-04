-- Supabase Migration: Gas & Water Express (SaaS Multi-tenant)
-- Description: Core tables with RLS and tenant isolation

-- 1. Create Tenants Table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Admin Users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'operator',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Drivers
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'offline',
    vehicle_model TEXT,
    vehicle_plate TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'São Paulo',
    credit_limit DECIMAL DEFAULT 500,
    total_debts DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL NOT NULL,
    cost_price DECIMAL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    category TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    neighborhood TEXT,
    city TEXT,
    items JSONB NOT NULL, -- List of products/quantities
    total DECIMAL NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'Pendente',
    driver_id UUID REFERENCES drivers(id),
    notes TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Sample Policy: Only allow access to data from the user's tenant
-- (Requires authentication setup with jwt claims for tenant_id)
CREATE POLICY tenant_isolation_policy ON orders
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- 7. Initial Sample Data
INSERT INTO tenants (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'Gás Express Central');
