import { useCart } from '../context/CartContext.jsx'
import Link from 'next/link'

function formatPrice(cents) { return `$${(cents / 100).toFixed(2)}` }

export default function CartPage() {
  const { items, updateQty, removeItem, total } = useCart()
  return (
    <div>
      <h1>Cart</h1>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.map(i => (
        <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <img src={i.image} alt={i.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <div>{i.name}</div>
            <div className="price">{formatPrice(i.price)}</div>
          </div>
          <input type="number" min="1" className="input" style={{ width: 80 }} value={i.qty} onChange={e => updateQty(i.id, parseInt(e.target.value || '1'))} />
          <button className="btn" onClick={() => removeItem(i.id)}>Remove</button>
        </div>
      ))}
      {items.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Total: <span className="price">{formatPrice(total)}</span></div>
          <Link href="/checkout" className="btn">Checkout</Link>
        </div>
      )}
    </div>
  )
}
