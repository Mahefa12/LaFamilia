import cookie from 'cookie'

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', cookie.serialize('admin_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: -1 }))
  res.json({ ok: true })
}
