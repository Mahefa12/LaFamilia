import prisma from '../../../lib/prisma.js'
import bcrypt from 'bcryptjs'
import { signAdminToken } from '../../../lib/auth.js'
import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body || {}
  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin) return res.status(401).json({ error: 'Invalid' })
  const ok = bcrypt.compareSync(password || '', admin.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid' })
  const token = signAdminToken(admin)
  res.setHeader('Set-Cookie', cookie.serialize('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' }))
  res.json({ ok: true })
}
