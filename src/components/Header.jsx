import Link from 'next/link'
import { useCart } from '../context/CartContext.jsx'

export default function Header() {
  const { count } = useCart()
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">La Familia</Link>
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/cart">Cart ({count})</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
