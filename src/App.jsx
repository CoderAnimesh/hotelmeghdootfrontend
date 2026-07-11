import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GoogleOAuthProvider } from '@react-oauth/google'

import Loader from './components/Loader.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Rooms from './components/Rooms.jsx'
import About from './components/About.jsx'
import Services from './components/Services.jsx'
import Gallery from './components/Gallery.jsx'
import Testimonials from './components/Testimonials.jsx'
import BookingCTA from './components/BookingCTA.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import BookingPortal from './components/BookingPortal.jsx'
import AdminPortal from './components/AdminPortal.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import WhatsAppButton from './components/WhatsAppButton.jsx'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const isAdminRoute = window.location.pathname === '/admin'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState('home') // 'home' | 'booking'
  const [selectedRoom, setSelectedRoom] = useState(null)

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleBookNow = (room = null) => {
    setSelectedRoom(room)
    setView('booking')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    setView('home')
    setSelectedRoom(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Admin portal — separate route
  if (isAdminRoute) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AdminPortal />
      </GoogleOAuthProvider>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* Splash loader on first visit */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <Loader key="loader" onComplete={handleLoaderComplete} />
        )}
      </AnimatePresence>

      {/* Main site — only rendered after loader finishes */}
      {!isLoading && (
        <>
          <ScrollToTop />
          <WhatsAppButton />

          {view === 'booking' ? (
            /* ── Booking Portal View ── */
            <BookingPortal
              selectedRoom={selectedRoom}
              setView={setView}
              onBack={handleBackToHome}
            />
          ) : (
            /* ── Main Landing Page View ── */
            <>
              <Navbar onBookNow={() => handleBookNow()} />
              <main>
                <Hero onBookNow={() => handleBookNow()} />
                <Rooms onSelectRoom={handleBookNow} />
                <About />
                <Services />
                <Gallery />
                <Testimonials />
                <BookingCTA onBookNow={() => handleBookNow()} />
                <Contact />
              </main>
              <Footer />
            </>
          )}
        </>
      )}
    </GoogleOAuthProvider>
  )
}

export default App
