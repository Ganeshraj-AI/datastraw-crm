import { useState, useEffect } from 'react'

function TicketsPage({ onViewTicket }) {
  // 1. State to store the tickets fetched from FastAPI
  const [tickets, setTickets] = useState([])
  
  // 2. States for Search and Status Filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // 3. State to manage loading and error feedback
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 4. Success alert state for deletion feedback
  const [deleteSuccess, setDeleteSuccess] = useState(null)

  // Fetch tickets from FastAPI when the component loads
  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = () => {
    setIsLoading(true)
    fetch('http://localhost:8000/api/tickets')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to retrieve tickets from the backend.')
        }
        return response.json()
      })
      .then((data) => {
        setTickets(data)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // 5. Delete ticket implementation
  const handleDelete = (ticketId) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticketId}?`)) {
      return
    }

    fetch(`http://localhost:8000/api/tickets/${ticketId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete the ticket from the database.')
        }
        return response.json()
      })
      .then(() => {
        // Display a brief deletion success alert
        setDeleteSuccess(`Ticket ${ticketId} was successfully deleted.`)
        setTimeout(() => setDeleteSuccess(null), 3000)
        
        // Refresh the local tickets list
        fetchTickets()
      })
      .catch((err) => {
        alert(err.message)
      })
  }

  // Helper function to calculate ticket age in days
  const getTicketAge = (createdAtString) => {
    const created = new Date(createdAtString)
    const now = new Date()
    // Calculate difference in milliseconds
    const diffTime = Math.abs(now - created)
    // Convert to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper to determine SLA Age status parameters
  const getAgeSlaParams = (age) => {
    if (age <= 2) {
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        indicator: '🟢'
      }
    } else if (age <= 6) {
      return {
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        indicator: '🟡'
      }
    } else {
      return {
        badgeClass: 'bg-red-50 text-red-700 border border-red-200',
        indicator: '🔴'
      }
    }
  }

  // 6. Filter tickets based on searchTerm and statusFilter
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || ticket.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Support Tickets</h2>
          <p className="text-gray-600 mt-1">View and manage customer support requests.</p>
        </div>
      </div>

      {deleteSuccess && (
        <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm border border-emerald-100 font-medium animate-fade-in">
          {deleteSuccess}
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Search Tickets</label>
          <input
            type="text"
            placeholder="Search by customer, subject, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Status Indicators (Loading / Error / Empty states) */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm animate-pulse">Loading tickets from database...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!isLoading && !error && filteredTickets.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg text-gray-400">
          No tickets found matching your query.
        </div>
      )}

      {/* Tickets Table */}
      {!isLoading && !error && filteredTickets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-250">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-150">
              {filteredTickets.map((ticket) => {
                const age = getTicketAge(ticket.created_at)
                const sla = getAgeSlaParams(age)

                return (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {ticket.ticket_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {ticket.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${
                          ticket.priority.toLowerCase() === 'high'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ticket.priority.toLowerCase() === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${
                          ticket.status.toLowerCase() === 'open'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ticket.status.toLowerCase() === 'pending' || ticket.status.toLowerCase() === 'in progress'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full border uppercase ${sla.badgeClass}`}>
                        <span className="mr-1">{sla.indicator}</span> {age} {age === 1 ? 'Day' : 'Days'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => onViewTicket(ticket.ticket_id)}
                        className="text-blue-600 hover:text-blue-900 font-semibold cursor-pointer mr-4"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.ticket_id)}
                        className="text-red-600 hover:text-red-900 font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TicketsPage
