"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles } from "lucide-react"
import AISuggestionsPanel from "@/components/ai-suggestions-panel"

interface ResumeSection {
  id: string
  title: string
  content: string
}

export default function CreateResume() {
  const [title, setTitle] = useState("")
  const [sections, setSections] = useState<ResumeSection[]>([
    { id: "introduction", title: "Introduction", content: "" },
    { id: "experience", title: "Experience", content: "" },
    { id: "skills", title: "Skills", content: "" },
    { id: "closing", title: "Closing", content: "" },
  ])
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("introduction")
  const [suggestionsPanel, setSuggestionsPanel] = useState({
    isOpen: false,
    section: "",
    suggestions: [] as string[],
  })
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a resume title",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a resume",
          variant: "destructive",
        })
        return
      }

      // Combine all sections into one content string
      const content = sections
        .map(section => `${section.title}\n${section.content}`)
        .join("\n\n")

      const { error } = await supabase
        .from("resumes")
        .insert([
          {
            title,
            content,
            user_id: user.id,
          },
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Resume created successfully",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGetSuggestions = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    try {
      const response = await fetch("/api/generate-resume-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: sectionId,
          content: section.content,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }

      const { suggestions } = await response.json()
      setSuggestionsPanel({
        isOpen: true,
        section: section.title,
        suggestions,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate suggestions",
        variant: "destructive",
      })
    }
  }

  const handleInsertSuggestion = (suggestion: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === activeSection
          ? {
              ...section,
              content: section.content
                ? `${section.content}\n${suggestion}`
                : suggestion,
            }
          : section
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Create Resume</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Resume Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter a title for your resume"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex space-x-4 mb-4">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                          activeSection === section.id
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>

                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`space-y-4 ${
                        activeSection === section.id ? "block" : "hidden"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          {section.title}
                        </h3>
                        <button
                          onClick={() => handleGetSuggestions(section.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          AI Help
                        </button>
                      </div>
                      <div>
                        <textarea
                          rows={8}
                          value={section.content}
                          onChange={(e) =>
                            setSections(prev =>
                              prev.map(s =>
                                s.id === section.id
                                  ? { ...s, content: e.target.value }
                                  : s
                              )
                            )
                          }
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder={`Enter your ${section.title.toLowerCase()}...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Resume"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AISuggestionsPanel
        isOpen={suggestionsPanel.isOpen}
        onClose={() =>
          setSuggestionsPanel(prev => ({ ...prev, isOpen: false }))
        }
        suggestions={suggestionsPanel.suggestions}
        onInsert={handleInsertSuggestion}
        section={suggestionsPanel.section}
      />
    </div>
  )
} 