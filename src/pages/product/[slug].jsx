import Head from 'next/head'
import prisma from '../../lib/prisma.js'
import { useCart } from '../../context/CartContext.jsx'

export async function getServerSideProps({ params }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug } })
  if (!product) return { notFound: true }
  return { props: { product: JSON.parse(JSON.stringify(product)) } }
}

function formatPrice(cents) { return `$${(cents / 100).toFixed(2)}` }

export default function ProductPage({ product }) {
  const { addItem } = useCart()
  const images = JSON.parse(product.imagesJson || '[]')
  const img = images[0] || '/images/placeholder.jpg'
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images.map(u => `${u}`),
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  }
  return (
    <>
      <Head>
        <title>{product.name} — La Familia</title>
        <meta name="description" content={product.description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} data-reveal>
        <img src={img} alt={product.name} style={{ width: '100%', borderRadius: 8 }} />
        <div>
          <h1>{product.name}</h1>
          <div className="price">{formatPrice(product.price)}</div>
          <p>{product.description}</p>
          <button className="btn btn-primary" onClick={() => addItem(product, 1)}>Add to Cart</button>
        </div>
      </div>
    </>
  )
}
