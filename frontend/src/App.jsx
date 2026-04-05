import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

import Home           from './pages/Home'
import Login          from './pages/Login'
import Checkout       from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import Portal         from './pages/Portal'
import Admin          from './pages/Admin'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', color:'#CBD5E1' }}>Loading…</div>
  if (!user)   return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<Home />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/checkout"        element={<Checkout />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/portal" element={
        <ProtectedRoute><Portal /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><Admin /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
