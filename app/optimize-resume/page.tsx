"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles } from "lucide-react"

export default function OptimizeResume() {
  const [jobDescription, setJobDescription] = useState("")
  const [optimizedContent, setOptimizedContent] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleOptimize = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      })

      if (!response.ok) {
        throw new Error("Failed to optimize resume")
      }

      const data = await response.json()
      setOptimizedContent(data.content)
      
      toast({
        title: "Success",
        description: "Resume optimized successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!optimizedContent) {
      toast({
        title: "Error",
        description: "Please generate an optimized resume first",
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
          description: "You must be logged in to save a resume",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("resumes")
        .insert([
          {
            title: "Optimized Resume",
            content: optimizedContent,
            user_id: user.id,
          },
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Resume saved successfully",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Optimize Resume</h1>
              </div>
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
                    htmlFor="jobDescription"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Job Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="jobDescription"
                      name="jobDescription"
                      rows={10}
                      required
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Paste the job description here..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleOptimize}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {loading ? "Optimizing..." : "Generate Recommendation"}
                  </button>
                </div>

                {optimizedContent && (
                  <>
                    <div>
                      <label
                        htmlFor="optimizedContent"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Optimized Resume
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="optimizedContent"
                          name="optimizedContent"
                          rows={20}
                          value={optimizedContent}
                          onChange={(e) => setOptimizedContent(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Saving..." : "Save Resume"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 