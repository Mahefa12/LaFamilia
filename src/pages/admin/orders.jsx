import { getAdminFromReq } from '../../lib/auth.js'
import { useEffect, useState } from 'react'

export async function getServerSideProps({ req }) {
  const admin = await getAdminFromReq(req)
  if (!admin) return { redirect: { destination: '/admin/login', permanent: false } }
  return { props: {} }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])

  async function load() {
    const res = await fetch('/api/orders')
    const data = await res.json()
    setOrders(data.orders)
  }
  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  return (
    <div>
      <h1>Orders</h1>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Customer</th><th>Total</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customerName}</td>
              <td>${(o.totalAmount/100).toFixed(2)}</td>
              <td>
                <select className="select" value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                  <option>PENDING</option>
                  <option>PAID</option>
                  <option>SHIPPED</option>
                  <option>COMPLETED</option>
                  <option>CANCELLED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
