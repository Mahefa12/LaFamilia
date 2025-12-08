import prisma from '../src/lib/prisma.js'
import bcrypt from 'bcryptjs'

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function run() {
  const adminEmail = 'admin@lafamilia.com'
  const adminPassword = 'Admin123!'
  const hash = bcrypt.hashSync(adminPassword, 10)
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: hash, name: 'Admin' }
  })

  const products = [
    {
      name: 'La Familia Luxe Sneaker',
      description: 'Premium leather sneaker with gold accents.',
      price: 29900,
      category: 'Shoes',
      stock: 25,
      images: ['/images/sneaker1.jpg']
    },
    {
      name: 'La Familia Signature Sweater',
      description: 'Soft knit sweater in black with gold embroidery.',
      price: 15900,
      category: 'Sweaters',
      stock: 40,
      images: ['/images/sweater1.jpg']
    },
    {
      name: 'La Familia Classic Jeans',
      description: 'Slim-fit dark denim jeans.',
      price: 12900,
      category: 'Jeans',
      stock: 50,
      images: ['/images/jeans1.jpg']
    },
    {
      name: 'La Familia Gold Accent Bag',
      description: 'Bold and trendy bag with gold hardware.',
      price: 21900,
      category: 'Bags',
      stock: 30,
      images: ['/images/bag1.jpg']
    }
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: slugify(p.name) },
      update: {},
      create: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        imagesJson: JSON.stringify(p.images)
      }
    })
  }

  console.log('Seeded')
}

run().then(() => prisma.$disconnect())
