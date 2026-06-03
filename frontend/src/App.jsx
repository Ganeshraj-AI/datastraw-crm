import { useState, useEffect } from 'react'
import TicketsPage from './TicketsPage'
import CreateTicketPage from './CreateTicketPage'
import TicketDetailsPage from './TicketDetailsPage'
import logo from './assets/logo.png'
import { supabase } from './supabase'
import AuthPage from './AuthPage'

const API_URL = import.meta.env.VITE_API_URL

const ADMIN_EMAILS = [
  'ganeshraj4020@gmail.com',
  'hr@datastraw.com'
]

function App() {
  // Supabase Authentication states
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)

  // Navigation states
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedTicketId, setSelectedTicketId] = useState(null)

  // Dashboard stats states
  const [tickets, setTickets] = useState([])
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // 1. Subscribe to Supabase Authentication sessions & changes
  useEffect(() => {
    // Check current active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        // Route default landing page based on active role
        if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
          setCurrentPage('dashboard')
        } else {
          setCurrentPage('customer-create')
        }
      }
    })

    // Listen to live authorization updates (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
          setCurrentPage('dashboard')
        } else {
          setCurrentPage('customer-create')
        }
      } else {
        setCurrentPage('dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Derive Admin authorization role from email
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  // 3. Fetch stats only for Admin on Dashboard views
  useEffect(() => {
    if (isAdmin && currentPage === 'dashboard') {
      setIsLoadingStats(true)
      fetch(`${API_URL}/api/tickets`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch statistics.')
          }
          return response.json()
        })
        .then((data) => {
          setTickets(data)
        })
        .catch((err) => {
          console.error('Error fetching dashboard statistics:', err)
        })
        .finally(() => {
          setIsLoadingStats(false)
        })
    }
  }, [currentPage, isAdmin])

  // Stats helper variables
  const getTicketAge = (createdAtString) => {
    const created = new Date(createdAtString)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const totalCount = tickets.length
  const openCount = tickets.filter((t) => t.status.toLowerCase() === 'open').length
  const inProgressCount = tickets.filter((t) => t.status.toLowerCase() === 'in progress' || t.status.toLowerCase() === 'pending').length
  const closedCount = tickets.filter((t) => t.status.toLowerCase() === 'closed').length
  const highPriorityCount = tickets.filter((t) => t.priority.toLowerCase() === 'high').length
  const agingCount = tickets.filter((t) => getTicketAge(t.created_at) >= 7).length

  // Callback triggers for router redirection
  const handleViewTicket = (ticketId) => {
    setSelectedTicketId(ticketId)
    setCurrentPage('ticket-details')
  }

  // Handle Supabase sign-out
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error.message)
    }
  }

  // 4. AUTH GUARD: Render Authentication Form if user is logged out
  if (!user) {
    return <AuthPage />
  }

  // Helper function to render the correct view based on currentPage and role
  const renderPage = () => {
    // CUSTOMER VIEW INTERCEPTOR
    if (!isAdmin) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-blue-600 uppercase tracking-wide">Customer Support Portal</span>
              <p className="text-sm text-gray-700 mt-1">Logged in as: <strong className="font-semibold">{user.email}</strong></p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors shadow-sm cursor-pointer"
            >
              Sign Out
            </button>
          </div>
          <CreateTicketPage onTicketCreated={() => alert('Support ticket successfully submitted!')} />
        </div>
      )
    }

    // ADMIN VIEWS
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">CRM Dashboard</h2>
            <p className="text-gray-600">Welcome to your Customer Support Ticket CRM system. Here is a real-time summary of your tickets.</p>
            
            {isLoadingStats ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm animate-pulse">Calculating support statistics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Total Tickets Card */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Total Tickets</span>
                  <p className="text-4xl font-black text-blue-900 mt-2">{totalCount}</p>
                </div>
                
                {/* Open Tickets Card */}
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 shadow-sm">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Open</span>
                  <p className="text-4xl font-black text-amber-900 mt-2">{openCount}</p>
                </div>

                {/* In Progress Tickets Card */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-sm">
                  <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">In Progress</span>
                  <p className="text-4xl font-black text-purple-900 mt-2">{inProgressCount}</p>
                </div>

                {/* Closed Tickets Card */}
                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 shadow-sm">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Closed</span>
                  <p className="text-4xl font-black text-emerald-900 mt-2">{closedCount}</p>
                </div>

                {/* High Priority Tickets Card */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-150 shadow-sm">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">High Priority</span>
                  <p className="text-4xl font-black text-red-900 mt-2">{highPriorityCount}</p>
                </div>

                {/* Aging Tickets Card */}
                <div className="bg-gray-100 p-6 rounded-lg border border-gray-250 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Aging Tickets (&ge; 7 Days)</span>
                  <p className="text-4xl font-black text-gray-800 mt-2">{agingCount}</p>
                </div>
              </div>
            )}
          </div>
        )
      case 'tickets':
        return (
          <TicketsPage onViewTicket={handleViewTicket} />
        )
      case 'create-ticket':
        return (
          <CreateTicketPage onTicketCreated={() => setCurrentPage('tickets')} />
        )
      case 'ticket-details':
        return (
          <TicketDetailsPage ticketId={selectedTicketId} onBack={() => setCurrentPage('tickets')} />
        )
      default:
        return (
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">Page not found.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-28">
            {/* Logo Section */}
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage(isAdmin ? 'dashboard' : 'customer-create')}>
              <img src={logo} alt="Datastraw Logo" className="h-[60px] md:h-[80px] w-auto object-contain" />
            </div>

            {/* Navigation Tabs (Only visible for Admin users) */}
            {isAdmin && (
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentPage('tickets')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === 'tickets'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Tickets
                </button>
                <button
                  onClick={() => setCurrentPage('create-ticket')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === 'create-ticket'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Create Ticket
                </button>
                
                {/* Admin Sign Out Link */}
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </nav>
            )}
            
            {/* Simple logout button visible for logged-in Customers in the navbar corner */}
            {!isAdmin && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-500">
          DataStraw CRM &copy; {new Date().getFullYear()} - Built for Learning React & FastAPI.
        </div>
      </footer>
    </div>
  )
}

export default App
