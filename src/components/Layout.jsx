import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      <main className="container">{children}</main>
      <Footer />
    </div>
  )
}
