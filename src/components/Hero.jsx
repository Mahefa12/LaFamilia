import Link from 'next/link'
import { useState } from 'react'

export default function Hero() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  function move(e) {
    const x = (e.clientX / window.innerWidth - 0.5) * 12
    const y = (e.clientY / window.innerHeight - 0.5) * 8
    setPos({ x, y })
  }
  return (
    <section className="hero" onMouseMove={move}>
      <div className="hero-bg" style={{ backgroundImage: 'url(/images/hero.jpg)', transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(1.08)` }} />
      <div className="container hero-content" data-reveal>
        <h1>Luxury, bold and trendy</h1>
        <p>Premium shoes and apparel with a signature black, white and gold aesthetic.</p>
        <Link href="/shop" className="btn btn-primary">Shop Now</Link>
      </div>
    </section>
  )
}
