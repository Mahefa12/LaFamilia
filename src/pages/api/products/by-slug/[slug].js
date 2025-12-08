import prisma from '../../../../lib/prisma.js'

export default async function handler(req, res) {
  const { slug } = req.query
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return res.status(404).json({ error: 'Not found' })
  res.json({ product })
}
