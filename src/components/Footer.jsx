export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>© {new Date().getFullYear()} La Familia</div>
        <div>
          Follow: 
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="nav-link"> Instagram</a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="nav-link"> TikTok</a>
        </div>
      </div>
    </footer>
  )
}
