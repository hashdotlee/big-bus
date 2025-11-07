-- =====================================================
-- BUS BOOKING SYSTEM - DATABASE SCHEMA
-- PostgreSQL Database Design
-- =====================================================

-- =====================================================
-- 1. USER MANAGEMENT SCHEMA
-- =====================================================

-- Users table (base table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    avatar_url TEXT,
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    
    -- User type and status
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'driver', 'staff', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    
    -- Authentication
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Referral system
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Staff details (for drivers and other staff)
CREATE TABLE staff_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(50),
    position VARCHAR(50),
    hire_date DATE NOT NULL,
    
    -- For drivers
    license_number VARCHAR(50),
    license_type VARCHAR(20),
    license_expiry DATE,
    years_of_experience INTEGER,
    
    -- Banking info for salary
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(255),
    
    -- Performance metrics
    rating DECIMAL(3,2) DEFAULT 0,
    total_trips INTEGER DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    
    -- Schedule and availability
    working_schedule JSONB, -- {"mon": ["08:00", "17:00"], "tue": ...}
    is_available BOOLEAN DEFAULT TRUE,
    current_location GEOGRAPHY(POINT),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer details
CREATE TABLE customer_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'corporate')),
    company_name VARCHAR(255),
    tax_code VARCHAR(50),
    
    -- Loyalty program
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    total_spent DECIMAL(12,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    
    -- Preferences
    preferred_seat_type VARCHAR(20),
    dietary_restrictions TEXT,
    special_needs TEXT,
    notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true, "zalo": true}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role and permission system
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

-- =====================================================
-- 2. VEHICLE MANAGEMENT SCHEMA
-- =====================================================

-- Vehicle types/categories
CREATE TABLE vehicle_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    seat_capacity INTEGER NOT NULL,
    features JSONB, -- {wifi: true, ac: true, toilet: true, tv: true}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_type_id UUID REFERENCES vehicle_types(id),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    color VARCHAR(30),
    
    -- Technical details
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid')),
    
    -- Status and condition
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'retired')),
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    mileage_km DECIMAL(10,2) DEFAULT 0,
    
    -- Documents
    insurance_number VARCHAR(50),
    insurance_expiry DATE,
    registration_expiry DATE,
    
    -- Tracking
    gps_device_id VARCHAR(100),
    current_location GEOGRAPHY(POINT),
    last_location_update TIMESTAMP WITH TIME ZONE,
    
    -- Seat layout
    seat_layout JSONB, -- 2D array representing seat positions
    total_seats INTEGER NOT NULL,
    
    -- Images
    images JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle maintenance records
CREATE TABLE vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2),
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    performed_by VARCHAR(255),
    next_maintenance_date DATE,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ROUTE AND SCHEDULE MANAGEMENT
-- =====================================================

-- Bus stations/stops
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    location GEOGRAPHY(POINT) NOT NULL,
    
    -- Station details
    type VARCHAR(20) CHECK (type IN ('terminal', 'stop', 'pickup_point')),
    facilities JSONB, -- {parking: true, waiting_room: true, restaurant: true}
    contact_phone VARCHAR(20),
    operating_hours JSONB, -- {"mon": ["05:00", "23:00"], ...}
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Route points
    origin_station_id UUID REFERENCES stations(id),
    destination_station_id UUID REFERENCES stations(id),
    
    -- Route details
    distance_km DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    base_price DECIMAL(10,2) NOT NULL,
    
    -- Intermediate stops
    stops JSONB, -- [{station_id, order, arrival_offset_minutes, departure_offset_minutes}]
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip schedules
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id),
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    
    -- Schedule details
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Recurring schedule
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB, -- {type: 'daily', days: ['mon', 'tue'], until: '2024-12-31'}
    
    -- Pricing
    price_multiplier DECIMAL(3,2) DEFAULT 1.0, -- For peak hours, holidays
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'in_transit', 'arrived', 'cancelled')),
    
    -- Seat availability
    available_seats INTEGER NOT NULL,
    booked_seats INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. BOOKING AND TICKETING
-- =====================================================

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id),
    schedule_id UUID REFERENCES schedules(id),
    
    -- Booking details
    booking_type VARCHAR(20) DEFAULT 'one_way' CHECK (booking_type IN ('one_way', 'round_trip', 'multi_city')),
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Passenger info
    passenger_count INTEGER NOT NULL DEFAULT 1,
    passengers JSONB NOT NULL, -- [{name, age, gender, id_number, seat_number}]
    
    -- Pickup and drop-off
    pickup_station_id UUID REFERENCES stations(id),
    dropoff_station_id UUID REFERENCES stations(id),
    pickup_address TEXT,
    dropoff_address TEXT,
    pickup_location GEOGRAPHY(POINT),
    dropoff_location GEOGRAPHY(POINT),
    
    -- Pricing
    base_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'boarding', 'completed', 'cancelled', 'no_show')),
    
    -- Seat details
    seat_numbers JSONB, -- ["A1", "A2", "B3"]
    
    -- Special requests
    special_requests TEXT,
    luggage_count INTEGER DEFAULT 0,
    
    -- Ratings and feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2),
    
    -- QR code for boarding
    qr_code TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring/subscription bookings
CREATE TABLE subscription_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    route_id UUID REFERENCES routes(id),
    
    -- Subscription details
    subscription_type VARCHAR(20) CHECK (subscription_type IN ('daily', 'weekly', 'monthly')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Schedule preferences
    preferred_times JSONB, -- ["07:00", "17:30"]
    preferred_seats JSONB,
    
    -- Pricing
    package_price DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    
    -- Auto-booking settings
    auto_book BOOLEAN DEFAULT TRUE,
    notify_before_minutes INTEGER DEFAULT 60,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. PAYMENT AND TRANSACTIONS
-- =====================================================

-- Payment transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    user_id UUID REFERENCES users(id),
    
    -- Transaction details
    type VARCHAR(20) CHECK (type IN ('payment', 'refund', 'wallet_topup', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Payment gateway info
    gateway VARCHAR(50), -- vnpay, momo, zalopay, stripe
    gateway_transaction_id VARCHAR(100),
    gateway_response JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled')),
    
    -- Additional info
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User wallet
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id),
    balance DECIMAL(12,2) DEFAULT 0 CHECK (balance >= 0),
    locked_balance DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'VND',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES wallets(id),
    transaction_id UUID REFERENCES transactions(id),
    
    type VARCHAR(20) CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    
    description TEXT,
    reference_type VARCHAR(50), -- booking, refund, bonus, etc
    reference_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. LOYALTY AND PROMOTIONS
-- =====================================================

-- Promotions/Coupons
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Discount details
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_booking_amount DECIMAL(10,2),
    
    -- Usage limits
    usage_limit INTEGER,
    usage_per_customer INTEGER DEFAULT 1,
    used_count INTEGER DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Conditions
    applicable_routes JSONB, -- array of route_ids
    applicable_vehicle_types JSONB,
    applicable_customer_tiers JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotion usage tracking
CREATE TABLE promotion_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promotion_id UUID REFERENCES promotions(id),
    user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (promotion_id, user_id, booking_id)
);

-- Loyalty points transactions
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    
    type VARCHAR(20) CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted')),
    points INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Reference
    reference_type VARCHAR(50), -- booking, promotion, manual_adjustment
    reference_id UUID,
    
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards catalog
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    
    points_required INTEGER NOT NULL,
    quantity_available INTEGER,
    quantity_redeemed INTEGER DEFAULT 0,
    
    -- Reward type
    reward_type VARCHAR(20) CHECK (reward_type IN ('discount_coupon', 'free_ticket', 'upgrade', 'merchandise')),
    reward_value JSONB, -- depends on type
    
    -- Images
    image_url TEXT,
    
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward redemptions
CREATE TABLE reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id),
    reward_id UUID REFERENCES rewards(id),
    
    points_spent INTEGER NOT NULL,
    redemption_code VARCHAR(50) UNIQUE,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'used', 'expired')),
    
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. SUPPORT AND FEEDBACK
-- =====================================================

-- Support tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    
    -- Ticket details
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Priority and status
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    
    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket messages
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to customer
    attachments JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. NOTIFICATIONS AND COMMUNICATIONS
-- =====================================================

-- Notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('email', 'sms', 'push', 'zalo')),
    
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB, -- Available variables for template
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications log
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    type VARCHAR(20) CHECK (type IN ('email', 'sms', 'push', 'zalo', 'in_app')),
    channel VARCHAR(50),
    
    subject VARCHAR(255),
    content TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
    
    -- Metadata
    metadata JSONB,
    error_message TEXT,
    
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. ANALYTICS AND REPORTING
-- =====================================================

-- Daily statistics snapshot
CREATE TABLE daily_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    
    -- Booking metrics
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(12,2) DEFAULT 0,
    ticket_revenue DECIMAL(12,2) DEFAULT 0,
    service_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Customer metrics
    new_customers INTEGER DEFAULT 0,
    active_customers INTEGER DEFAULT 0,
    
    -- Operational metrics
    total_trips INTEGER DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    average_occupancy_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Route performance
    route_statistics JSONB, -- {route_id: {bookings, revenue, occupancy}}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    ip_address INET,
    user_agent TEXT,
    
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. AFFILIATE SYSTEM
-- =====================================================

-- Affiliate partners
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL, -- Percentage
    
    -- Stats
    total_referrals INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_commission DECIMAL(12,2) DEFAULT 0,
    
    -- Payment info
    payment_method VARCHAR(50),
    payment_details JSONB,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate transactions
CREATE TABLE affiliate_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES affiliates(id),
    booking_id UUID REFERENCES bookings(id),
    
    booking_amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    
    paid_at TIMESTAMP WITH TIME ZONE,
    payment_reference VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_referral ON users(referral_code);

-- Booking indexes
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_code ON bookings(booking_code);

-- Schedule indexes
CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_schedules_departure ON schedules(departure_time);
CREATE INDEX idx_schedules_status ON schedules(status);

-- Transaction indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Location indexes
CREATE INDEX idx_stations_location ON stations USING GIST(location);
CREATE INDEX idx_vehicles_location ON vehicles USING GIST(current_location);

-- Support ticket indexes
CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA FOR ROLES
-- =====================================================

INSERT INTO roles (name, description, permissions) VALUES
('super_admin', 'Full system access', '["*"]'::jsonb),
('admin', 'Administrative access', '["users.*", "bookings.*", "vehicles.*", "routes.*", "reports.*"]'::jsonb),
('driver', 'Driver access', '["schedules.view", "schedules.update_status", "bookings.view", "vehicles.view_assigned"]'::jsonb),
('staff', 'Staff access', '["bookings.*", "customers.view", "support.*"]'::jsonb),
('customer', 'Customer access', '["bookings.create", "bookings.view_own", "profile.*", "wallet.view_own"]'::jsonb);

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Revenue by route view
CREATE VIEW revenue_by_route AS
SELECT 
    r.id as route_id,
    r.name as route_name,
    COUNT(b.id) as total_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(s.booked_seats::decimal / s.available_seats) as avg_occupancy_rate
FROM routes r
LEFT JOIN schedules s ON r.id = s.route_id
LEFT JOIN bookings b ON s.id = b.schedule_id
WHERE b.status = 'completed'
GROUP BY r.id, r.name;

-- Driver performance view
CREATE VIEW driver_performance AS
SELECT 
    u.id as driver_id,
    u.full_name as driver_name,
    sd.rating,
    sd.total_trips,
    sd.total_distance_km,
    COUNT(DISTINCT b.id) as total_bookings,
    AVG(b.rating) as avg_booking_rating
FROM users u
JOIN staff_details sd ON u.id = sd.user_id
LEFT JOIN schedules s ON u.id = s.driver_id
LEFT JOIN bookings b ON s.id = b.schedule_id
WHERE u.user_type = 'driver'
GROUP BY u.id, u.full_name, sd.rating, sd.total_trips, sd.total_distance_km;

-- Customer lifetime value view
CREATE VIEW customer_lifetime_value AS
SELECT 
    u.id as customer_id,
    u.full_name as customer_name,
    cd.loyalty_tier,
    cd.total_spent,
    cd.total_bookings,
    cd.loyalty_points,
    u.created_at as customer_since,
    MAX(b.booking_date) as last_booking_date
FROM users u
JOIN customer_details cd ON u.id = cd.user_id
LEFT JOIN bookings b ON u.id = b.customer_id
WHERE u.user_type = 'customer'
GROUP BY u.id, u.full_name, cd.loyalty_tier, cd.total_spent, cd.total_bookings, cd.loyalty_points, u.created_at;
