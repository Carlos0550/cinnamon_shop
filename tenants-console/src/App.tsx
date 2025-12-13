import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import TenantsList from './routes/TenantsList'
import TenantDetail from './routes/TenantDetail'

export default function App() {
  const nav = useNavigate()
  return (
    <div className="app">
      <header className="header">
        <h1 className="title" onClick={() => nav('/')}>Tenants Console</h1>
        <nav className="nav">
          <Link to="/">Tenants</Link>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<TenantsList />} />
          <Route path="/tenants/:id" element={<TenantDetail />} />
        </Routes>
      </main>
    </div>
  )
}
