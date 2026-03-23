# MyGloven App — Connect Auth to Supabase (Real Mode)

## Context
This is a React + Vite + Supabase app at ~/projects/mygloven-app on a Mac Mini.
The Supabase project has tables already created (profiles, venues, artistas, proveedores, eventos, propuestas, suscripciones, mensajes, notificaciones).

The `profiles` table schema:
- id: UUID (references auth.users.id)
- nombre: TEXT
- email: TEXT
- avatar_url: TEXT
- rol: TEXT ('admin' | 'venue' | 'artista' | 'proveedor' | 'cliente')
- plan: TEXT ('explorador' | 'creador' | 'productor')
- estado: TEXT ('activo' | 'pendiente' | 'bloqueado')
- created_at, updated_at: TIMESTAMPTZ

There's a trigger `handle_new_user` that auto-creates a profile when a user registers via auth.users with rol='cliente' and estado='pendiente'.

## Supabase Credentials
- URL: https://tfaihuqlokcvakoscuav.supabase.co
- Anon Key: (check Vercel env vars or .env.example — use the one from the existing deployment)
- Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWlodXFsb2tjdmFrb3NjdWF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDE5NjUxOCwiZXhwIjoyMDg5NzcyNTE4fQ.DlzWAvVTWUSggObG8pf8y-GhkdwcxMjBLaUd8zeniUw

## Tasks

### 1. Create .env file
```
VITE_SUPABASE_URL=https://tfaihuqlokcvakoscuav.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYWlodXFsb2tjdmFrb3NjdWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxOTY1MTgsImV4cCI6MjA4OTc3MjUxOH0.kKDMSzGLxEE-I7p6NLR-2JNhIN1FNEfLBBMYCZnoM0w
```

### 2. Update src/data/mockData.ts
- Change Role type to: `'admin' | 'venue' | 'artista' | 'proveedor' | 'cliente'`
- Update Profile interface to match Supabase schema:
  ```typescript
  export interface Profile {
    id: string
    nombre: string
    email: string
    avatar_url: string | null
    rol: Role
    plan: string | null
    estado: 'activo' | 'pendiente' | 'bloqueado'
    created_at: string
    updated_at: string
  }
  ```
- Update roleNavItems keys to match new role names ('artista' instead of 'artist', 'proveedor' instead of 'provider', 'cliente' instead of 'organizer')
- Add 'admin' nav items (Dashboard, Users, Venues, Artistas, Proveedores, Settings)
- Keep mock stats data as-is for now

### 3. Rewrite src/hooks/useAuth.ts
- Remove DEMO_MODE completely — always use real Supabase
- fetchProfile should query by `id` (not `user_id`), since profiles.id = auth.users.id
- signUp should pass `nombre` (not `display_name`) in user_metadata so the trigger can use it:
  ```typescript
  options: { data: { nombre: displayName } }
  ```
- setRole should update the profile's `rol` field and also `nombre`:
  ```typescript
  await supabase.from('profiles').update({ rol: role, nombre: displayName }).eq('id', user.id)
  ```
- After setRole, re-fetch the profile to update state
- Add a `createUser` function for admin use (uses service role — see below)

### 4. Create src/lib/supabaseAdmin.ts
A separate admin client using the service role key (for creating users from the admin panel):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null
```
Add `VITE_SUPABASE_SERVICE_ROLE_KEY` to .env as well.

**IMPORTANT:** The service role key in the frontend is only for the admin panel during development. In production this would be a server-side function.

### 5. Update src/components/auth/RoleSelect.tsx
- Use new role values: 'venue', 'artista', 'proveedor', 'cliente'
- Update labels to Spanish: "Propietario de Venue", "Artista", "Proveedor de Servicios", "Organizador de Eventos"
- Update descriptions to Spanish
- Don't show 'admin' as a selectable role here (admin is assigned manually)

### 6. Update RegisterForm.tsx
- Change "Display Name" label to "Nombre"
- Change placeholder to "Tu nombre"
- Change button text to "Crear cuenta"
- Change "Already have an account?" to "¿Ya tienes cuenta?"

### 7. Update LoginForm.tsx
- Change button text to "Iniciar sesión"  
- Change "Don't have an account?" to "¿No tienes cuenta?"
- Change "Sign up" link text to "Regístrate"

### 8. Update SelectRolePage.tsx
- Change heading to "Elige tu rol"
- Change description to "Selecciona cómo usarás mygloven. Puedes cambiarlo después."

### 9. Update LoginPage.tsx
- Change subtitle to "Accede a tu panel"

### 10. Update RegisterPage.tsx
- Change subtitle to "Crea tu cuenta"

### 11. Create src/pages/admin/UsersPage.tsx
A simple admin page to:
- List all users (profiles) in a table
- Button to create a new user (opens a modal/form)
- Create user form: nombre, email, password, rol (dropdown with all roles including admin)
- Uses supabaseAdmin to create users via `supabase.auth.admin.createUser()`
- After creating auth user, update the profile's rol and estado to 'activo'

### 12. Add admin route
In src/routes/index.tsx, add:
```
{ path: 'admin/users', element: <LazyPage><UsersPage /></LazyPage> }
```

### 13. Update Sidebar.tsx and AppShell.tsx
- Use profile.rol (not profile.role) to determine which nav items to show
- Make sure admin role shows admin nav items

### 14. Update all components that reference `profile.role` to use `profile.rol` and `profile.display_name` to `profile.nombre`

### Important Notes
- Do NOT delete or rename files unnecessarily
- Keep the existing visual style (dark theme, coral accent color)
- All new UI text should be in Spanish
- The app should compile without errors after changes (`npm run build`)
- Test by running `npm run dev` to make sure it starts
