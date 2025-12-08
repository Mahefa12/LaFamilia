import Link from 'next/link'
import { getAdminFromReq } from '../../lib/auth.js'

export async function getServerSideProps({ req }) {
  const admin = await getAdminFromReq(req)
  if (!admin) return { redirect: { destination: '/admin/login', permanent: false } }
  return { props: { admin: { email: admin.email } } }
}

export default function AdminHome({ admin }) {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Signed in as {admin.email}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/admin/products" className="btn">Manage Products</Link>
        <Link href="/admin/orders" className="btn">Manage Orders</Link>
      </div>
    </div>
  )
}
