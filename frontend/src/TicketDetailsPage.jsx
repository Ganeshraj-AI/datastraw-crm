import { useState, useEffect } from 'react'

function TicketDetailsPage({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Notes & Comments state variables
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [isFetchingNotes, setIsFetchingNotes] = useState(true)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [noteSuccess, setNoteSuccess] = useState(false)

  // Fetch ticket details and notes on component mount
  useEffect(() => {
    fetchTicketDetails()
    fetchNotes()
  }, [ticketId])

  const fetchTicketDetails = () => {
    setIsLoading(true)
    fetch(`http://localhost:8000/api/tickets/${ticketId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to retrieve ticket details.')
        }
        return response.json()
      })
      .then((data) => {
        setTicket(data)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const fetchNotes = () => {
    setIsFetchingNotes(true)
    fetch(`http://localhost:8000/api/tickets/${ticketId}/notes`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to retrieve ticket notes.')
        }
        return response.json()
      })
      .then((data) => {
        setNotes(data)
      })
      .catch((err) => {
        console.error('Error fetching notes:', err)
      })
      .finally(() => {
        setIsLoading(false)
        setIsFetchingNotes(false)
      })
  }

  // Handle ticket status update (PUT request)
  const handleStatusChange = (newStatus) => {
    setIsUpdating(true)
    setUpdateSuccess(false)
    
    fetch(`http://localhost:8000/api/tickets/${ticketId}?status=${encodeURIComponent(newStatus)}`, {
      method: 'PUT'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update ticket status.')
        }
        return response.json()
      })
      .then((data) => {
        // Update local state with the new status
        setTicket((prevTicket) => ({
          ...prevTicket,
          status: data.status
        }))
        setUpdateSuccess(true)
        setTimeout(() => setUpdateSuccess(false), 3000)
      })
      .catch((err) => {
        alert(err.message)
      })
      .finally(() => {
        setIsUpdating(false)
      })
  }

  // Handle adding notes (POST request)
  const handleAddNote = (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setIsAddingNote(true)
    setNoteSuccess(false)

    fetch(`http://localhost:8000/api/tickets/${ticketId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note_text: newNote })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to save the note.')
        }
        return response.json()
      })
      .then(() => {
        setNewNote('')
        setNoteSuccess(true)
        setTimeout(() => setNoteSuccess(false), 2000)
        fetchNotes() // Refresh notes list instantly
      })
      .catch((err) => {
        alert(err.message)
      })
      .finally(() => {
        setIsAddingNote(false)
      })
  }

  // Handle ticket deletion (DELETE request)
  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to permanently delete ticket ${ticket.ticket_id}?`)) {
      return
    }

    fetch(`http://localhost:8000/api/tickets/${ticketId}`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete the ticket from the system.')
        }
        return response.json()
      })
      .then(() => {
        alert(`Ticket ${ticket.ticket_id} was successfully deleted.`)
        onBack() // Triggers parent navigation back to listing
      })
      .catch((err) => {
        alert(err.message)
      })
  }

  // Helper functions for SLA Age calculation
  const getTicketAge = (createdAtString) => {
    const created = new Date(createdAtString)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const getAgeSlaParams = (age) => {
    if (age <= 2) {
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        text: '🟢 Healthy'
      }
    } else if (age <= 6) {
      return {
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        text: '🟡 Attention'
      }
    } else {
      return {
        badgeClass: 'bg-red-50 text-red-700 border border-red-200',
        text: '🔴 Aging'
      }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center py-12">
        <p className="text-gray-500 text-sm animate-pulse">Retrieving ticket information...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 mb-6 font-medium">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Back to List
        </button>
      </div>
    )
  }

  const age = getTicketAge(ticket.created_at)
  const sla = getAgeSlaParams(age)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <span>&larr; Back to List</span>
        </button>
        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg">
          {ticket.ticket_id}
        </span>
      </div>

      {updateSuccess && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs border border-emerald-100 mb-6 font-semibold">
          Ticket status updated successfully!
        </div>
      )}

      {/* Ticket Details Panel */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight leading-snug">{ticket.subject}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Status Badge */}
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

            {/* Priority Badge */}
            <span
              className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${
                ticket.priority.toLowerCase() === 'high'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : ticket.priority.toLowerCase() === 'medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              Priority: {ticket.priority}
            </span>

            {/* Age/SLA Badge */}
            <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border uppercase tracking-wider ${sla.badgeClass}`}>
              {sla.text} ({age} {age === 1 ? 'Day' : 'Days'} Old)
            </span>

            <span className="text-xs text-gray-400 ml-2">Created: {new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Customer Information Box */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-150 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Customer Name</span>
            <span className="text-sm font-semibold text-gray-800">{ticket.customer_name}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Customer Email</span>
            <a href={`mailto:${ticket.customer_email}`} className="text-sm font-medium text-blue-600 hover:underline">
              {ticket.customer_email}
            </a>
          </div>
        </div>

        {/* Ticket Description */}
        <div>
          <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Description</span>
          <div className="bg-white p-4 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-inner">
            {ticket.description}
          </div>
        </div>

        {/* Notes / Comments Section */}
        <div className="pt-6 border-t border-gray-200">
          <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Notes / Comments</span>
          
          {noteSuccess && (
            <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg text-xs border border-emerald-100 mb-3 font-semibold">
              Note added successfully!
            </div>
          )}

          {/* New Note Form */}
          <form onSubmit={handleAddNote} className="mb-4">
            <textarea
              required
              rows="2"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type internal note here..."
              disabled={isAddingNote}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50 resize-none"
            ></textarea>
            <div className="flex justify-end mt-1.5">
              <button
                type="submit"
                disabled={isAddingNote || !newNote.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors focus:outline-none disabled:bg-blue-300 cursor-pointer"
              >
                {isAddingNote ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </form>

          {/* Notes List */}
          {isFetchingNotes ? (
            <p className="text-xs text-gray-400 animate-pulse">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No notes yet.</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 p-3 rounded-lg border border-gray-150 text-sm">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
                  <span className="block text-[10px] text-gray-400 mt-1 font-semibold">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Updator Action Panel */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Update Status</span>
            <p className="text-xs text-gray-400 mt-0.5">Move ticket through support workflow.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange('Open')}
              disabled={isUpdating}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                ticket.status.toLowerCase() === 'open'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => handleStatusChange('In Progress')}
              disabled={isUpdating}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                ticket.status.toLowerCase() === 'in progress' || ticket.status.toLowerCase() === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusChange('Closed')}
              disabled={isUpdating}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                ticket.status.toLowerCase() === 'closed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Danger Zone / Delete Panel */}
        <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-red-500 uppercase tracking-wide">Danger Zone</span>
            <p className="text-xs text-gray-400 mt-0.5">Permanently delete this support ticket from database.</p>
          </div>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-lg border border-red-200 transition-colors cursor-pointer"
          >
            Delete Ticket
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailsPage
