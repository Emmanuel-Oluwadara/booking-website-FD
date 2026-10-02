import { useState } from 'react'
import './StudioApp.css'

const APPOINTMENTS_KEY = 'heritage-hair-studio-appointments'

const services = [
  {
    id: 'signature-cut',
    name: 'The Signature Cut',
    category: 'CUT & STYLE',
    duration: '60 min',
    price: 78,
    description: 'A considered cut shaped around your texture, routine, and the way you like to wear your hair.',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1100&q=85',
  },
  {
    id: 'dimensional-colour',
    name: 'Dimensional Colour',
    category: 'COLOUR',
    duration: '150 min',
    price: 185,
    description: 'Soft dimension and a custom gloss, blended for a colour that grows out beautifully.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1100&q=85',
  },
  {
    id: 'silk-press',
    name: 'Silk Press & Finish',
    category: 'TEXTURE & FINISH',
    duration: '90 min',
    price: 110,
    description: 'A smooth, bouncy finish with a nourishing cleanse and heat-conscious styling.',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1100&q=85',
  },
]

const products = [
  {
    id: 'daily-wash',
    name: 'Daily Ritual Shampoo',
    detail: 'Gentle cleanse · 250 ml',
    price: 28,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'soften-mask',
    name: 'Softening Hair Mask',
    detail: 'Weekly moisture · 200 ml',
    price: 34,
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'shine-oil',
    name: 'Finishing Shine Oil',
    detail: 'Lightweight gloss · 50 ml',
    price: 32,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85',
  },
]

const navigation = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Hair services' },
  { id: 'products', label: 'Products' },
  { id: 'booking', label: 'Book appointment' },
  { id: 'appointments', label: 'My appointments' },
  { id: 'profile', label: 'Profile' },
  { id: 'dashboard', label: 'Dashboard' },
]

function getToday() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getTomorrow() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function readAppointments() {
  try {
    const savedAppointments = JSON.parse(window.localStorage.getItem(APPOINTMENTS_KEY))
    return Array.isArray(savedAppointments) ? savedAppointments : []
  } catch {
    return []
  }
}

function formatAppointmentDate(dateValue) {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateValue}T12:00:00`))
}

function StudioApp({ user, onLogout, onProfileUpdate }) {
  const [view, setView] = useState('home')
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id)
  const [appointments, setAppointments] = useState(readAppointments)
  const [bag, setBag] = useState([])
  const [notice, setNotice] = useState('')
  const [profileMessage, setProfileMessage] = useState('')

  const selectedService = services.find((service) => service.id === selectedServiceId) ?? services[0]
  const upcomingAppointments = appointments
    .filter((appointment) => appointment.date >= getToday())
    .sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`))
  const nextAppointment = upcomingAppointments[0]
  const firstName = user.name.trim().split(/\s+/)[0]
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  function navigate(nextView) {
    setView(nextView)
    setNotice('')
    setProfileMessage('')
  }

  function openService(serviceId) {
    setSelectedServiceId(serviceId)
    navigate('service-detail')
  }

  function startBooking(serviceId = selectedServiceId) {
    setSelectedServiceId(serviceId)
    navigate('booking')
  }

  function saveAppointments(nextAppointments) {
    setAppointments(nextAppointments)
    try {
      window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(nextAppointments))
    } catch {
      setNotice('This browser could not save the request. It will be available until you leave this page.')
    }
  }

  function submitBooking(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newAppointment = {
      id: `${Date.now()}`,
      serviceId: formData.get('service'),
      date: formData.get('date'),
      time: formData.get('time'),
      stylist: formData.get('stylist'),
    }
    saveAppointments([newAppointment, ...appointments])
    setView('appointments')
    setNotice('Demo request saved in this browser. The studio has not been notified.')
  }

  function cancelAppointment(appointmentId) {
    const remainingAppointments = appointments.filter((appointment) => appointment.id !== appointmentId)
    saveAppointments(remainingAppointments)
    setNotice('Demo appointment request removed.')
  }

  function saveProfile(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onProfileUpdate({
      name: formData.get('profileName').trim(),
      email: formData.get('profileEmail').trim().toLowerCase(),
    })
    setProfileMessage('Profile updated in this browser.')
  }

  function addToBag(product) {
    setBag((currentBag) => [...currentBag, product])
    setNotice(`${product.name} added to your bag. Checkout is not connected in this preview.`)
  }

  function renderServiceCard(service) {
    return (
      <article className="service-card" key={service.id}>
        <button className="service-image-button" type="button" onClick={() => openService(service.id)} aria-label={`View ${service.name} details`}>
          <img src={service.image} alt="Salon hairstyle inspiration" />
          <span>{service.category}</span>
        </button>
        <div className="service-card-body">
          <div className="service-title-row">
            <h3>{service.name}</h3>
            <strong>${service.price}</strong>
          </div>
          <p>{service.duration} <span>·</span> {service.description}</p>
          <button className="quiet-link" type="button" onClick={() => openService(service.id)}>View details <span aria-hidden="true">↗</span></button>
        </div>
      </article>
    )
  }

  function renderAppointment(appointment) {
    const service = services.find((item) => item.id === appointment.serviceId) ?? services[0]
    return (
      <article className="appointment-row" key={appointment.id}>
        <div className="appointment-date-block">
          <strong>{new Date(`${appointment.date}T12:00:00`).getDate()}</strong>
          <span>{new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(`${appointment.date}T12:00:00`))}</span>
        </div>
        <div className="appointment-main">
          <h3>{service.name}</h3>
          <p>{formatAppointmentDate(appointment.date)} <span>·</span> {appointment.time}</p>
          <small>With {appointment.stylist} <span>·</span> Demo request</small>
        </div>
        <button className="quiet-link cancel-link" type="button" onClick={() => cancelAppointment(appointment.id)}>Remove request</button>
      </article>
    )
  }

  function renderPage() {
    if (view === 'services') {
      return (
        <>
          <div className="page-heading">
            <div><p className="eyebrow"><span /> THE SERVICE MENU</p><h1>Hair services</h1><p>Personalized care, shaped around you.</p></div>
            <button className="primary-action" type="button" onClick={() => startBooking()}>Book a visit <span aria-hidden="true">↗</span></button>
          </div>
          <div className="service-grid">{services.map(renderServiceCard)}</div>
        </>
      )
    }

    if (view === 'service-detail') {
      return (
        <>
          <button className="back-link" type="button" onClick={() => navigate('services')}>← Hair services</button>
          <section className="service-detail-layout">
            <img className="service-detail-image" src={selectedService.image} alt="Salon hairstyle inspiration" />
            <div className="service-detail-copy">
              <p className="eyebrow"><span /> {selectedService.category}</p>
              <h1>{selectedService.name}</h1>
              <p className="service-detail-description">{selectedService.description}</p>
              <div className="detail-facts"><span>{selectedService.duration}</span><strong>${selectedService.price}</strong></div>
              <div className="detail-includes"><h2>Your appointment includes</h2><p>A thoughtful consultation, a tailored service, and simple care advice to take home.</p></div>
              <button className="primary-action" type="button" onClick={() => startBooking(selectedService.id)}>Choose a time <span aria-hidden="true">↗</span></button>
            </div>
          </section>
        </>
      )
    }

    if (view === 'products') {
      return (
        <>
          <div className="page-heading">
            <div><p className="eyebrow"><span /> THE AT-HOME EDIT</p><h1>Products</h1><p>Studio favourites for your everyday routine.</p></div>
            <div className="bag-count" aria-live="polite">Your bag <strong>{bag.length}</strong></div>
          </div>
          {notice && <p className="studio-notice" role="status">{notice}</p>}
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <img src={product.image} alt={product.name} />
                <div className="product-info"><div><h2>{product.name}</h2><p>{product.detail}</p></div><strong>${product.price}</strong></div>
                <button className="secondary-action" type="button" onClick={() => addToBag(product)}>Add to bag <span aria-hidden="true">+</span></button>
              </article>
            ))}
          </div>
          <p className="demo-caption">Product catalogue preview. Payments and fulfilment are not connected.</p>
        </>
      )
    }

    if (view === 'booking') {
      return (
        <>
          <div className="page-heading compact-heading"><div><p className="eyebrow"><span /> MAKE IT YOURS</p><h1>Book an appointment</h1><p>Choose a service and a time that works for you.</p></div></div>
          <div className="booking-layout">
            <form className="booking-form" onSubmit={submitBooking}>
              <label className="field-label" htmlFor="booking-service">Service
                <select id="booking-service" name="service" value={selectedServiceId} onChange={(event) => setSelectedServiceId(event.target.value)} required>
                  {services.map((service) => <option key={service.id} value={service.id}>{service.name} · ${service.price}</option>)}
                </select>
              </label>
              <label className="field-label" htmlFor="booking-stylist">Stylist
                <select id="booking-stylist" name="stylist" defaultValue="Amara James" required>
                  <option>Amara James</option><option>Nia Bennett</option><option>First available</option>
                </select>
              </label>
              <label className="field-label" htmlFor="booking-date">Date
                <input id="booking-date" name="date" type="date" min={getToday()} defaultValue={getTomorrow()} required />
              </label>
              <label className="field-label" htmlFor="booking-time">Available time
                <select id="booking-time" name="time" defaultValue="10:30 AM" required>
                  <option>9:00 AM</option><option>10:30 AM</option><option>12:00 PM</option><option>2:00 PM</option><option>3:30 PM</option>
                </select>
              </label>
              <p className="booking-demo-note">Demo booking only. This request is saved in your browser and is not sent to the studio.</p>
              <button className="primary-action" type="submit">Save appointment request <span aria-hidden="true">↗</span></button>
            </form>
            <aside className="booking-summary"><p className="eyebrow"><span /> YOUR SELECTION</p><h2>{selectedService.name}</h2><p>{selectedService.duration} <span>·</span> ${selectedService.price}</p><div className="summary-rule" /><p>We’ll keep your request in My appointments so it’s easy to find again.</p></aside>
          </div>
        </>
      )
    }

    if (view === 'appointments') {
      return (
        <>
          <div className="page-heading"><div><p className="eyebrow"><span /> YOUR STUDIO VISITS</p><h1>My appointments</h1><p>Upcoming visits and saved demo requests.</p></div><button className="primary-action" type="button" onClick={() => startBooking()}>Book a visit <span aria-hidden="true">↗</span></button></div>
          {notice && <p className="studio-notice" role="status">{notice}</p>}
          <section className="appointments-list" aria-label="Upcoming appointments">
            {upcomingAppointments.length ? upcomingAppointments.map(renderAppointment) : <div className="empty-state"><span>✳</span><h2>No visits on your calendar yet.</h2><p>Your next great hair day can start here.</p><button className="primary-action" type="button" onClick={() => startBooking()}>Find a time <span aria-hidden="true">↗</span></button></div>}
          </section>
        </>
      )
    }

    if (view === 'profile') {
      return (
        <>
          <div className="page-heading"><div><p className="eyebrow"><span /> YOUR DETAILS</p><h1>Profile</h1><p>Keep your studio account details up to date.</p></div></div>
          <form className="profile-form" onSubmit={saveProfile}>
            <div className="profile-avatar">{initials}</div>
            <label className="field-label" htmlFor="profileName">Full name<input id="profileName" name="profileName" type="text" defaultValue={user.name} autoComplete="name" required /></label>
            <label className="field-label" htmlFor="profileEmail">Email address<input id="profileEmail" name="profileEmail" type="email" defaultValue={user.email} autoComplete="email" required /></label>
            {profileMessage && <p className="studio-notice" role="status">{profileMessage}</p>}
            <button className="primary-action" type="submit">Save profile <span aria-hidden="true">↗</span></button>
            <button className="text-action profile-logout" type="button" onClick={onLogout}>Log out of Heritage Hair Studio</button>
          </form>
        </>
      )
    }

    if (view === 'dashboard') {
      return (
        <>
          <div className="page-heading"><div><p className="eyebrow"><span /> YOUR STUDIO AT A GLANCE</p><h1>Dashboard</h1><p>A quick look at your Heritage Hair Studio activity.</p></div></div>
          <div className="metric-grid">
            <article className="metric-item"><span>UPCOMING VISITS</span><strong>{upcomingAppointments.length}</strong><p>Saved on this device</p></article>
            <article className="metric-item"><span>FAVOURITE SERVICE</span><strong>{nextAppointment ? (services.find((service) => service.id === nextAppointment.serviceId)?.name ?? 'Hair care') : 'Discover'}</strong><p>Find a style for your next visit</p></article>
            <article className="metric-item"><span>PRODUCTS IN BAG</span><strong>{bag.length}</strong><p>Checkout is not connected</p></article>
          </div>
          <section className="dashboard-next"><div><p className="eyebrow"><span /> NEXT APPOINTMENT</p>{nextAppointment ? <><h2>{services.find((service) => service.id === nextAppointment.serviceId)?.name ?? 'Hair appointment'}</h2><p>{formatAppointmentDate(nextAppointment.date)} <span>·</span> {nextAppointment.time}</p></> : <><h2>Your next visit starts here.</h2><p>Choose a service and request a time that suits you.</p></>}<button className="quiet-link" type="button" onClick={() => navigate(nextAppointment ? 'appointments' : 'services')}>{nextAppointment ? 'View appointments' : 'Explore services'} <span aria-hidden="true">↗</span></button></div><button className="primary-action" type="button" onClick={() => startBooking()}>Book a visit <span aria-hidden="true">↗</span></button></section>
        </>
      )
    }

    return (
      <>
        <section className="home-welcome">
          <div className="home-welcome-copy"><p className="eyebrow"><span /> YOUR PLACE IN THE CHAIR</p><h1>Hello, {firstName}.</h1><p>Good hair days look different on everyone. Let’s find yours.</p><button className="primary-action" type="button" onClick={() => startBooking()}>Book your next visit <span aria-hidden="true">↗</span></button></div>
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85" alt="A guest with natural, softly styled hair" />
        </section>
        <section className="home-next-visit"><div><p className="eyebrow"><span /> YOUR NEXT GOOD HAIR DAY</p><h2>{nextAppointment ? services.find((service) => service.id === nextAppointment.serviceId)?.name : 'Nothing booked just yet'}</h2><p>{nextAppointment ? `${formatAppointmentDate(nextAppointment.date)} · ${nextAppointment.time}` : 'A little time for yourself is waiting.'}</p></div><button className="quiet-link" type="button" onClick={() => navigate('appointments')}>My appointments <span aria-hidden="true">↗</span></button></section>
        <section className="home-services"><div className="section-heading"><div><p className="eyebrow"><span /> A GOOD PLACE TO START</p><h2>Find your service</h2></div><button className="quiet-link" type="button" onClick={() => navigate('services')}>All services <span aria-hidden="true">↗</span></button></div><div className="service-grid home-service-grid">{services.slice(0, 3).map(renderServiceCard)}</div></section>
      </>
    )
  }

  const activeNavigation = view === 'service-detail' ? 'services' : view

  return (
    <main className="studio-app-shell">
      <header className="studio-app-header">
        <a className="app-brand" href="#studio-home" onClick={(event) => { event.preventDefault(); navigate('home') }}>
          <span className="app-brand-mark" aria-hidden="true">h.</span>
          <span>HERITAGE <small>HAIR STUDIO</small></span>
        </a>
        <div className="app-header-right"><span className="header-welcome">A little time for you, {firstName}</span><button className="header-avatar" type="button" aria-label="Open profile" onClick={() => navigate('profile')}>{initials}</button><button className="header-logout" type="button" onClick={onLogout}>Log out</button></div>
      </header>
      <nav className="studio-navigation" aria-label="Main navigation">
        {navigation.map((item) => <button className={activeNavigation === item.id ? 'nav-link active' : 'nav-link'} type="button" key={item.id} aria-current={activeNavigation === item.id ? 'page' : undefined} onClick={() => item.id === 'booking' ? startBooking() : navigate(item.id)}>{item.label}{item.id === 'products' && bag.length > 0 ? <span className="nav-count">{bag.length}</span> : null}</button>)}
      </nav>
      <section className={view === 'home' ? 'studio-main-content home-main-content' : 'studio-main-content'} aria-live="polite">
        {renderPage()}
      </section>
      <footer className="studio-app-footer"><span>HERITAGE HAIR STUDIO</span><span>Thoughtful care, always.</span><span>FRONT-END PREVIEW</span></footer>
    </main>
  )
}

export default StudioApp