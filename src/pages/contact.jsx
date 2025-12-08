import Head from 'next/head'
import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')
  async function submit(e) {
    e.preventDefault()
    setStatus('Sent')
  }
  return (
    <>
      <Head>
        <title>Contact — La Familia</title>
      </Head>
      <h1>Contact</h1>
      <p>Email: support@lafamilia.com</p>
      <p>Instagram: @lafamilia</p>
      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <textarea className="textarea" placeholder="Message" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
        <button className="btn" type="submit">Send</button>
        {status && <p>{status}</p>}
      </form>
    </>
  )
}
