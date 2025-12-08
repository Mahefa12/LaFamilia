import prisma from '../../../lib/prisma.js'
import { requireAdmin } from '../../../lib/auth.js'

export default async function handler(req, res) {
  const id = parseInt(req.query.id)
  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return res.status(404).json({ error: 'Not found' })
    return res.json({ product })
  }
  if (req.method === 'PUT') {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const { name, description, price, category, stock, images } = req.body || {}
    const product = await prisma.product.update({ where: { id }, data: { name, description, price: Number(price || 0), category, stock: Number(stock || 0), imagesJson: JSON.stringify(images || []) } })
    return res.json({ product })
  }
  if (req.method === 'DELETE') {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    await prisma.product.delete({ where: { id } })
    return res.json({ ok: true })
  }
  return res.status(405).end()
}
