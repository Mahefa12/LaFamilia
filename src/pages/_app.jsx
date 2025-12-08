import '../styles/globals.css'
import Layout from '../components/Layout.jsx'
import { CartProvider } from '../context/CartContext.jsx'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'))
    const obs = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add('reveal-visible')
      }
    }, { threshold: 0.1 })
    nodes.forEach(n => {
      n.classList.add('reveal')
      obs.observe(n)
    })
    return () => obs.disconnect()
  }, [])
  return (
    <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  )
}
