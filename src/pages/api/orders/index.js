import prisma from '../../../lib/prisma.js'
import { requireAdmin } from '../../../lib/auth.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json({ orders })
  }
  if (req.method === 'POST') {
    const { customerName, email, phone, address, city, country, paymentMethod, items } = req.body || {}
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Empty cart' })
    let total = 0
    for (const i of items) total += (i.qty || 1) * i.price
    const order = await prisma.order.create({ data: { customerName, email, phone, address, city, country, paymentMethod, totalAmount: total, itemsJson: JSON.stringify(items) } })
    for (const i of items) {
      await prisma.product.update({ where: { id: i.id }, data: { stock: { decrement: i.qty || 1 } } }).catch(() => {})
    }
    return res.json({ order })
  }
  return res.status(405).end()
}
