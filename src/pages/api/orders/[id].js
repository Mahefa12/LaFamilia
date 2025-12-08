import prisma from '../../../lib/prisma.js'
import { requireAdmin } from '../../../lib/auth.js'

export default async function handler(req, res) {
  const id = parseInt(req.query.id)
  if (req.method === 'GET') {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return res.status(404).json({ error: 'Not found' })
    return res.json({ order })
  }
  if (req.method === 'PUT') {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const { status } = req.body || {}
    const order = await prisma.order.update({ where: { id }, data: { status } })
    return res.json({ order })
  }
  return res.status(405).end()
}
