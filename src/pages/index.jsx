import Head from 'next/head'
import Hero from '../components/Hero.jsx'
import prisma from '../lib/prisma.js'
import ProductCard from '../components/ProductCard.jsx'

export async function getServerSideProps() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 6 })
  return { props: { products: JSON.parse(JSON.stringify(products)) } }
}

export default function Home({ products }) {
  return (
    <>
      <Head>
        <title>La Familia — Luxury, bold and trendy</title>
        <meta name="description" content="La Familia sells luxury shoes and apparel with a bold, trendy style." />
      </Head>
      <div data-reveal>
        <Hero />
      </div>
      <h2>Featured</h2>
      <div className="grid" data-reveal>
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  )
}
