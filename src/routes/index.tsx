import { createBrowserRouter, Navigate } from "react-router"
import { lazy, Suspense } from "react"
import AppShell from "../components/layout/AppShell"

import LoginPage from "../pages/auth/LoginPage"
import RegisterPage from "../pages/auth/RegisterPage"

const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"))
const SpacePage = lazy(() => import("../pages/venue/SpacePage"))
const BookingsPage = lazy(() => import("../pages/venue/BookingsPage"))
const ProfilePage = lazy(() => import("../pages/artist/ProfilePage"))
const EventsPage = lazy(() => import("../pages/organizer/EventsPage"))
const StudioPage = lazy(() => import("../pages/organizer/StudioPage"))
const UsersPage = lazy(() => import("../pages/admin/UsersPage"))
const PlaceholderPage = lazy(() => import("../pages/PlaceholderPage"))

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <LazyPage><DashboardPage /></LazyPage> },
      // Admin routes
      { path: "admin/users", element: <LazyPage><UsersPage /></LazyPage> },
      { path: "admin/venues", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "admin/artistas", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "admin/proveedores", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "admin/settings", element: <LazyPage><PlaceholderPage /></LazyPage> },
      // Venue routes
      { path: "venue/space", element: <LazyPage><SpacePage /></LazyPage> },
      { path: "venue/bookings", element: <LazyPage><BookingsPage /></LazyPage> },
      { path: "venue/calendar", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "venue/analytics", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "venue/settings", element: <LazyPage><PlaceholderPage /></LazyPage> },
      // Artist routes
      { path: "artist/profile", element: <LazyPage><ProfilePage /></LazyPage> },
      { path: "artist/portfolio", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "artist/calendar", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "artist/bookings", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "artist/analytics", element: <LazyPage><PlaceholderPage /></LazyPage> },
      // Provider routes
      { path: "provider/services", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "provider/quotes", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "provider/calendar", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "provider/clients", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "provider/settings", element: <LazyPage><PlaceholderPage /></LazyPage> },
      // Organizer routes
      { path: "organizer/events", element: <LazyPage><EventsPage /></LazyPage> },
      { path: "organizer/venues", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "organizer/budget", element: <LazyPage><PlaceholderPage /></LazyPage> },
      { path: "organizer/studio", element: <LazyPage><StudioPage /></LazyPage> },
      { path: "organizer/messages", element: <LazyPage><PlaceholderPage /></LazyPage> },
    ],
  },
])
