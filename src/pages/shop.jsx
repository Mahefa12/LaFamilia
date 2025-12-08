import Head from 'next/head'
import prisma from '../lib/prisma.js'
import ProductCard from '../components/ProductCard.jsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export async function getServerSideProps({ query }) {
  const q = query.q || ''
  const where = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}
  const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } })
  return { props: { products: JSON.parse(JSON.stringify(products)), q } }
}

export default function Shop({ products, q }) {
  const router = useRouter()
  const [term, setTerm] = useState(q || '')

  useEffect(() => { setTerm(q || '') }, [q])

  function search(e) {
    e.preventDefault()
    router.push(`/shop?q=${encodeURIComponent(term)}`)
  }

  return (
    <>
      <Head>
        <title>Shop — La Familia</title>
      </Head>
      <form onSubmit={search} style={{ marginBottom: 16 }} data-reveal>
        <input className="input" placeholder="Search products" value={term} onChange={e => setTerm(e.target.value)} />
      </form>
      <div className="grid" data-reveal>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  )
}
