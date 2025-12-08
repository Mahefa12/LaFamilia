import { useCart } from '../context/CartContext.jsx'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Checkout() {
  const { items, clear, total } = useCart()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', country: '', paymentMethod: 'Cash on Delivery' })
  const [status, setStatus] = useState('')

  async function submit(e) {
    e.preventDefault()
    const res = await fetch('/api/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: form.name, email: form.email, phone: form.phone, address: form.address, city: form.city, country: form.country, paymentMethod: form.paymentMethod, items })
    })
    const data = await res.json()
    if (res.ok) {
      clear()
      setStatus(`Order placed. ID ${data.order.id}`)
      router.push(`/`)
    } else {
      setStatus(data.error || 'Error')
    }
  }

  return (
    <div>
      <h1>Checkout</h1>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.length > 0 && (
        <form onSubmit={submit} className="form">
          <div className="form-row">
            <input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-row">
            <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="form-row">
            <input className="input" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <input className="input" placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
          </div>
          <select className="select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
            <option>Cash on Delivery</option>
            <option>Card (test)</option>
          </select>
          <button className="btn" type="submit">Confirm Order</button>
          {status && <p>{status}</p>}
          <p>Total: ${(total/100).toFixed(2)}</p>
        </form>
      )}
    </div>
  )
}
