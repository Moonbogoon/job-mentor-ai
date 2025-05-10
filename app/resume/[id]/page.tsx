"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles, MessageSquare } from "lucide-react"

export default function ResumePage({ params }: { params: { id: string } }) {
  const [resume, setResume] = useState<any>(null)
  const [optimizedContent, setOptimizedContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }

        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) throw error
        setResume(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load resume",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }

    fetchResume()
  }, [params.id, router, supabase, toast])

  const handleOptimize = async () => {
    if (!resume?.content) {
      toast({
        title: "Error",
        description: "No resume content to optimize",
        variant: "destructive",
      })
      return
    }

    setOptimizing(true)

    try {
      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription: resume.content }),
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
      setOptimizing(false)
    }
  }

  const handleUpdate = async () => {
    if (!optimizedContent) {
      toast({
        title: "Error",
        description: "No optimized content to save",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("resumes")
        .update({ content: optimizedContent })
        .eq("id", params.id)

      if (error) throw error

      setResume({ ...resume, content: optimizedContent })
      setOptimizedContent("")
      
      toast({
        title: "Success",
        description: "Resume updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">{resume.title}</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
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
                    htmlFor="content"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Resume Content
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="content"
                      name="content"
                      rows={20}
                      value={resume.content}
                      onChange={(e) => setResume({ ...resume, content: e.target.value })}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => router.push(`/interview/${params.id}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start AI Interview
                  </button>
                  <button
                    onClick={handleOptimize}
                    disabled={optimizing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {optimizing ? "Optimizing..." : "Optimize with AI"}
                  </button>
                </div>

                {optimizedContent && (
                  <>
                    <div>
                      <label
                        htmlFor="optimizedContent"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Optimized Version
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="optimizedContent"
                          name="optimizedContent"
                          rows={20}
                          value={optimizedContent}
                          onChange={(e) => setOptimizedContent(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setOptimizedContent("")}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Discard Changes
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Saving..." : "Save Optimized Version"}
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