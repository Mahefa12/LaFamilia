import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('lafamilia_cart') : null
    if (raw) setItems(JSON.parse(raw))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('lafamilia_cart', JSON.stringify(items))
  }, [items])

  function addItem(product, qty = 1) {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx].qty += qty
        return copy
      }
      const images = JSON.parse(product.imagesJson || '[]')
      return [...prev, { id: product.id, name: product.name, price: product.price, qty, image: images[0] || '/images/placeholder.jpg' }]
    })
  }

  function removeItem(id) { setItems(prev => prev.filter(i => i.id !== id)) }
  function updateQty(id, qty) { setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i)) }
  function clear() { setItems([]) }

  const count = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items])
  const total = useMemo(() => items.reduce((a, i) => a + i.qty * i.price, 0), [items])

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, updateQty, clear, count, total }}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() { return useContext(CartCtx) }
