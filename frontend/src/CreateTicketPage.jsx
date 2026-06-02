import { useState } from 'react'

function CreateTicketPage({ onTicketCreated }) {
  // Form input states
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  // UI feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const newTicket = {
      customer_name: customerName,
      customer_email: customerEmail,
      subject: subject,
      description: description
    }

    fetch('http://localhost:8000/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTicket)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create ticket. Please check your network and try again.')
        }
        return response.json()
      })
      .then(() => {
        setSuccess(true)
        // Reset form inputs
        setCustomerName('')
        setCustomerEmail('')
        setSubject('')
        setDescription('')
        
        // Notify parent after a brief delay
        setTimeout(() => {
          onTicketCreated()
        }, 1500)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Create Support Ticket</h2>
      <p className="text-gray-600 mt-1 mb-6">Submit a new customer support request to the system.</p>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg text-sm border border-emerald-100 mb-6 font-medium">
          Ticket created successfully! Redirecting you to the tickets list...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 mb-6 font-medium">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="John Doe"
            disabled={isSubmitting || success}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Customer Email
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="john@example.com"
            disabled={isSubmitting || success}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Cannot connect to portal"
            disabled={isSubmitting || success}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            required
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide full details of the issue..."
            disabled={isSubmitting || success}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50 resize-none"
          ></textarea>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors focus:outline-none disabled:bg-blue-300 cursor-pointer"
          >
            {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateTicketPage
