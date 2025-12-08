import { getAdminFromReq } from '../../lib/auth.js'
import { useEffect, useState } from 'react'

export async function getServerSideProps({ req }) {
  const admin = await getAdminFromReq(req)
  if (!admin) return { redirect: { destination: '/admin/login', permanent: false } }
  return { props: {} }
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '', images: '' })

  async function load() {
    const res = await fetch('/api/products')
    const data = await res.json()
    setProducts(data.products)
  }
  useEffect(() => { load() }, [])

  async function addProduct(e) {
    e.preventDefault()
    const body = { ...form, price: parseInt(form.price || '0'), stock: parseInt(form.stock || '0'), images: form.images.split(',').map(s => s.trim()) }
    const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { setForm({ name: '', description: '', price: '', category: '', stock: '', images: '' }); load() }
  }

  async function remove(id) {
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1>Products</h1>
      <form onSubmit={addProduct} style={{ marginBottom: 24 }}>
        <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <textarea className="textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <div className="form-row">
          <input className="input" placeholder="Price (cents)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
          <input className="input" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
        </div>
        <div className="form-row">
          <input className="input" placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className="input" placeholder="Image URLs comma-separated" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
        </div>
        <button className="btn" type="submit">Add Product</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Price</th><th>Stock</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>${(p.price/100).toFixed(2)}</td>
              <td>{p.stock}</td>
              <td><button className="btn" onClick={() => remove(p.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
