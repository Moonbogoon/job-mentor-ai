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
  suggestions,
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
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        AI Suggestions for {section}
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 shadow-sm"
                        >
                          <p className="text-sm text-gray-700">{suggestion}</p>
                          <button
                            onClick={() => onInsert(suggestion)}
                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            Insert
                          </button>
                        </div>
                      ))}
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