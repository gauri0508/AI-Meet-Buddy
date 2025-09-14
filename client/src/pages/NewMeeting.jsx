import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Loader2, ArrowLeft } from 'lucide-react'
import api from '../utils/api'

const NewMeeting = () => {
  const [transcript, setTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!transcript.trim()) {
      setError('Please enter a meeting transcript')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/summarize', {
        transcript: transcript.trim()
      })

      // Navigate to dashboard with the new meeting data
      navigate('/dashboard', { 
        state: { 
          newMeeting: response.data,
          message: 'Meeting summarized successfully!' 
        }
      })
    } catch (err) {
      console.error('Error summarizing meeting:', err)
      setError(err.response?.data?.error || 'Failed to summarize meeting. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          New Meeting Summary
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Paste your meeting transcript below and let AI generate a summary and extract action items.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meeting Transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here... 

Example:
John: Welcome everyone to our weekly team meeting. Let's start with the project updates.
Sarah: I've completed the user interface design. We need to get feedback from the stakeholders by Friday.
Mike: The backend API is 80% complete. We should have it ready for testing next week.
John: Great! Sarah, can you prepare a presentation for the stakeholders? Mike, let's schedule a code review session.
Sarah: I'll prepare the presentation and send it out by Thursday.
Mike: I'll set up the code review for next Tuesday."
            className="w-full h-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {transcript.length} characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FileText size={20} />
                <span>Generate Summary</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How it works
        </h3>
        <ul className="text-blue-800 dark:text-blue-200 space-y-2">
          <li>• AI analyzes your transcript and generates key summary points</li>
          <li>• Action items are automatically extracted and converted to tasks</li>
          <li>• Tasks are added to your dashboard for easy management</li>
          <li>• You can edit task details, set deadlines, and assign priorities</li>
        </ul>
      </div>
    </div>
  )
}

export default NewMeeting
