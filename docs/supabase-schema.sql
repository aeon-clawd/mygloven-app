-- ============================================
-- MyGloven — Supabase Schema
-- Basado en modelo de datos funcional v1
-- ============================================

-- Usar auth.users de Supabase para autenticación
-- Esta tabla extiende el perfil del usuario
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    rol TEXT NOT NULL CHECK (rol IN ('admin', 'venue', 'artista', 'proveedor', 'cliente')) DEFAULT 'cliente',
    plan TEXT CHECK (plan IN ('explorador', 'creador', 'productor')),
    estado TEXT NOT NULL CHECK (estado IN ('activo', 'pendiente', 'bloqueado')) DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- VENUES
-- ============================================
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE,
    ciudad TEXT,
    direccion TEXT,
    aforo INTEGER,
    tipo TEXT CHECK (tipo IN ('sala', 'rooftop', 'restaurante', 'hotel', 'aire_libre')),
    subtipo TEXT,
    descripcion TEXT,
    telefono TEXT,
    email TEXT,
    web TEXT,
    tags TEXT[],
    verificado BOOLEAN NOT NULL DEFAULT false,
    exterior BOOLEAN DEFAULT false,
    rider BOOLEAN DEFAULT false,
    licencia_musica BOOLEAN DEFAULT false,
    equipo_sonido TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    logo_url TEXT,
    geo JSONB, -- {"lat": x, "lng": y}
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ARTISTAS
-- ============================================
CREATE TABLE IF NOT EXISTS artistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE,
    bio TEXT,
    genero_musical TEXT,
    rrss TEXT,
    spotify TEXT,
    youtube TEXT,
    linktree TEXT,
    telefono TEXT,
    email TEXT,
    tags TEXT[],
    verificado BOOLEAN NOT NULL DEFAULT false,
    rider TEXT,
    avatar_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROVEEDORES
-- ============================================
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE,
    tipo_servicio TEXT CHECK (tipo_servicio IN ('catering', 'sonido', 'foto', 'deco', 'seguridad', 'otro')),
    zona_cobertura TEXT,
    descripcion TEXT,
    precio_orientativo TEXT,
    tags TEXT[],
    verificado BOOLEAN NOT NULL DEFAULT false,
    telefono TEXT,
    email TEXT,
    web TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- EVENTOS (solicitudes de clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo TEXT CHECK (tipo IN ('concierto', 'fiesta', 'corporativo', 'boda', 'festival', 'otro')),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    ciudad TEXT,
    fecha_deseada DATE,
    num_personas INTEGER,
    presupuesto NUMERIC(10,2),
    estado TEXT NOT NULL CHECK (estado IN ('borrador', 'activo', 'en_propuestas', 'cerrado', 'cancelado')) DEFAULT 'borrador',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROPUESTAS (respuestas a eventos)
-- ============================================
CREATE TABLE IF NOT EXISTS propuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Solo uno de estos se rellena según quién propone
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    artista_id UUID REFERENCES artistas(id) ON DELETE SET NULL,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    precio_propuesto NUMERIC(10,2),
    disponibilidad BOOLEAN DEFAULT true,
    mensaje TEXT,
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'retirada')) DEFAULT 'pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Asegurar que al menos uno de los tres está relleno
    CONSTRAINT propuesta_origen CHECK (
        (venue_id IS NOT NULL)::int +
        (artista_id IS NOT NULL)::int +
        (proveedor_id IS NOT NULL)::int = 1
    )
);

-- ============================================
-- SUSCRIPCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('explorador', 'creador', 'productor')),
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    estado_pago TEXT NOT NULL CHECK (estado_pago IN ('activo', 'cancelado', 'expirado')) DEFAULT 'activo',
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- MENSAJES
-- ============================================
CREATE TABLE IF NOT EXISTS mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    de_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    para_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    evento_id UUID REFERENCES eventos(id) ON DELETE SET NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- NOTIFICACIONES
-- ============================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('nueva_solicitud', 'propuesta_recibida', 'propuesta_aceptada', 'mensaje_nuevo', 'verificacion', 'sistema')),
    contenido TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT false,
    link TEXT, -- deep link dentro de la app
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_venues_owner ON venues(owner_id);
CREATE INDEX idx_venues_ciudad ON venues(ciudad);
CREATE INDEX idx_artistas_owner ON artistas(owner_id);
CREATE INDEX idx_proveedores_owner ON proveedores(owner_id);
CREATE INDEX idx_eventos_cliente ON eventos(cliente_id);
CREATE INDEX idx_eventos_estado ON eventos(estado);
CREATE INDEX idx_propuestas_evento ON propuestas(evento_id);
CREATE INDEX idx_propuestas_autor ON propuestas(autor_id);
CREATE INDEX idx_mensajes_para ON mensajes(para_id, leido);
CREATE INDEX idx_mensajes_de ON mensajes(de_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id, leida);
CREATE INDEX idx_suscripciones_usuario ON suscripciones(usuario_id);

-- ============================================
-- FUNCIÓN: auto-crear profile al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nombre, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', 'Sin nombre'),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: cuando se registra un usuario en auth, se crea su profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCIÓN: auto-actualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at para todas las tablas
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON artistas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON propuestas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON suscripciones FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE artistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- PROFILES: cada usuario ve su propio perfil, admin ve todos
CREATE POLICY "Usuarios ven su propio perfil" ON profiles FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "Usuarios editan su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- VENUES: públicos para leer, solo owner edita, admin todo
CREATE POLICY "Venues visibles para todos" ON venues FOR SELECT USING (true);
CREATE POLICY "Owner gestiona su venue" ON venues FOR ALL USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);

-- ARTISTAS: públicos para leer, solo owner edita
CREATE POLICY "Artistas visibles para todos" ON artistas FOR SELECT USING (true);
CREATE POLICY "Owner gestiona su artista" ON artistas FOR ALL USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);

-- PROVEEDORES: públicos para leer, solo owner edita
CREATE POLICY "Proveedores visibles para todos" ON proveedores FOR SELECT USING (true);
CREATE POLICY "Owner gestiona su proveedor" ON proveedores FOR ALL USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);

-- EVENTOS: activos visibles para venue/artista/proveedor, owner ve todos los suyos
CREATE POLICY "Clientes ven sus eventos" ON eventos FOR SELECT USING (
    cliente_id = auth.uid()
    OR estado = 'activo'
    OR estado = 'en_propuestas'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "Clientes gestionan sus eventos" ON eventos FOR ALL USING (
    cliente_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);

-- PROPUESTAS: autor y cliente del evento pueden ver
CREATE POLICY "Ver propuestas relevantes" ON propuestas FOR SELECT USING (
    autor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM eventos WHERE id = evento_id AND cliente_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "Autor gestiona su propuesta" ON propuestas FOR ALL USING (
    autor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);

-- SUSCRIPCIONES: solo el usuario y admin
CREATE POLICY "Usuario ve su suscripción" ON suscripciones FOR SELECT USING (
    usuario_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);

-- MENSAJES: solo participantes
CREATE POLICY "Participantes ven mensajes" ON mensajes FOR SELECT USING (
    de_id = auth.uid() OR para_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "Usuarios envían mensajes" ON mensajes FOR INSERT WITH CHECK (de_id = auth.uid());

-- NOTIFICACIONES: solo el destinatario
CREATE POLICY "Usuario ve sus notificaciones" ON notificaciones FOR SELECT USING (
    usuario_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
);
CREATE POLICY "Usuario marca leídas" ON notificaciones FOR UPDATE USING (usuario_id = auth.uid());
