import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { Layout } from './components/Layout'
import { RequireAuth, RequireGuest } from './components/RouteGuards'
import { BookFormPage } from './pages/BookFormPage'
import { BooksPage } from './pages/BooksPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/new" element={<BookFormPage />} />
              <Route path="/books/:id/edit" element={<BookFormPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
