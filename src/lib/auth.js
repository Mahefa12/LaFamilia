import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import prisma from './prisma.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export function signAdminToken(admin) {
  return jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' })
}

export async function getAdminFromReq(req) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  const token = cookies.admin_token
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const admin = await prisma.adminUser.findUnique({ where: { id: payload.id } })
    return admin
  } catch {
    return null
  }
}

export async function requireAdmin(req, res) {
  const admin = await getAdminFromReq(req)
  if (!admin) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  return admin
}
