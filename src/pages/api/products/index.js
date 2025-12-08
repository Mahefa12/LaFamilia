import prisma from '../../../lib/prisma.js'
import { requireAdmin } from '../../../lib/auth.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
    return res.json({ products })
  }
  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res)
    if (!admin) return
    const { name, description, price, category, stock, images } = req.body || {}
    function slugify(str) { return String(str).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') }
    const product = await prisma.product.create({ data: { name, slug: slugify(name), description, price: Number(price || 0), category, stock: Number(stock || 0), imagesJson: JSON.stringify(images || []) } })
    return res.json({ product })
  }
  return res.status(405).end()
}
