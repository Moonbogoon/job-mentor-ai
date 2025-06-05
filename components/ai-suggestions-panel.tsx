import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
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
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden z-50"
        onClose={onClose}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        AI Suggestions for {section}
                      </Dialog.Title>
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
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 