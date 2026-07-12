import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'

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
import TableBooking from './components/TableBooking.jsx'
import MarriageHall from './components/MarriageHall.jsx'
import HallEnquirySection from './components/HallEnquirySection.jsx'



const isAdminRoute = window.location.pathname === '/admin'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState('home') // 'home' | 'booking' | 'tableBooking' | 'marriageHall'
  const [selectedRoom, setSelectedRoom] = useState(null)
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasVerifier = params.has('neon_auth_session_verifier');
    const isRedirecting = localStorage.getItem("neon_auth_redirecting");
    const viewParam = params.get('view');

    if (hasVerifier || isRedirecting === "true" || viewParam === 'booking') {
      setView('booking');
      
      // Clean up localStorage and URL parameter only if we do not need to preserve the verifier for the session exchange
      if (!hasVerifier) {
        localStorage.removeItem("neon_auth_redirecting");
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleBookNow = (room = null) => {
    setSelectedRoom(room)
    setView('booking')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBookTable = () => {
    setView('tableBooking')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMarriageHall = () => {
    setView('marriageHall')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToHome = () => {
    setView('home')
    setSelectedRoom(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Admin portal — separate route
  if (isAdminRoute) {
    return <AdminPortal />
  }

  return (
    <>
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
            /* ── Room Booking Portal View ── */
            <BookingPortal
              selectedRoom={selectedRoom}
              setView={setView}
              onBack={handleBackToHome}
            />
          ) : view === 'tableBooking' ? (
            /* ── Table Booking View ── */
            <TableBooking onBack={handleBackToHome} />
          ) : view === 'marriageHall' ? (
            /* ── Marriage Hall View ── */
            <MarriageHall onBack={handleBackToHome} />
          ) : (
            /* ── Main Landing Page View ── */
            <>
              <Navbar
                onBookNow={() => handleBookNow()}
                onBookTable={handleBookTable}
                onMarriageHall={handleMarriageHall}
              />
              <main>
                <Hero onBookNow={() => handleBookNow()} />
                <Rooms onSelectRoom={handleBookNow} />
                <About />
                <Services />
                <Gallery />
                <HallEnquirySection />
                <Testimonials />
                <BookingCTA onBookNow={() => handleBookNow()} />
                <Contact />
              </main>
              <Footer />
            </>
          )}
        </>
      )}
    </>
  )
}

export default App
