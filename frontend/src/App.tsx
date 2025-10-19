import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/layout/Layout'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import Categories from '@/pages/Categories'
import Users from '@/pages/Users'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={<Login />} />
        <Route path="/" element={<Layout />}> 
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}