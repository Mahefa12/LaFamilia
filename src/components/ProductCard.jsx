import Link from 'next/link'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function ProductCard({ product }) {
  const images = JSON.parse(product.imagesJson || '[]')
  const img = images[0] || '/images/placeholder.jpg'
  return (
    <div className="card" data-reveal>
      <img src={img} alt={product.name} />
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="title">{product.name}</div>
            <div className="price">{formatPrice(product.price)}</div>
          </div>
          <Link href={`/product/${product.slug}`} className="btn btn-outline">View</Link>
        </div>
      </div>
    </div>
  )
}
