import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog"
import { X } from "lucide-react"

interface AISuggestionsPanelProps {
  isOpen: boolean
  onClose: () => void
  suggestions: string[]
  onInsert: (suggestion: string) => void
  section: string
}

export default function AISuggestionsPanel({
  isOpen,
  onClose,
  suggestions = [],
  onInsert,
  section,
}: AISuggestionsPanelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-y-0 right-0 w-screen max-w-md bg-white shadow-xl">
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 sm:px-6">
            <div className="flex items-start justify-between">
              <DialogTitle className="text-lg font-medium text-gray-900">
                AI Suggestions for {section}
              </DialogTitle>
              <div className="ml-3 h-7 flex items-center">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 relative flex-1 px-4 sm:px-6">
            <div className="space-y-4">
              {Array.isArray(suggestions) && suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 shadow-sm"
                  >
                    <p className="text-sm text-gray-700">{suggestion}</p>
                    <button
                      onClick={() => onInsert(suggestion)}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Insert this suggestion
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No suggestions available at the moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 