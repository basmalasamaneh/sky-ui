import './globals.css'
import { Header } from "../components/Header"
import Footer from '../components/Footer'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'

export const metadata = {
  title: 'فنانو فلسطين - Athar |أثر',
  description: '',
  keywords: [],
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="antialiased selection:bg-gold selection:text-white bg-white">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen pt-20">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}