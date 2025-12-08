import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@lafamilia.com')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState('')
  async function submit(e) {
    e.preventDefault()
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (res.ok) router.push('/admin')
    else setError('Invalid credentials')
  }
  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Admin Login</h1>
      <form onSubmit={submit}>
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn" type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  )
}
