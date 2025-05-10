"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { format } from "date-fns"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface Resume {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
}

export default function ResumePage({ params }: { params: { id: string } }) {
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const checkUserAndFetchResume = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) throw error

        // Check if the resume belongs to the current user
        if (data.user_id !== user.id) {
          toast({
            title: "Error",
            description: "You don't have permission to view this resume",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setResume(data)
      } catch (error) {
        console.error("Error fetching resume:", error)
        toast({
          title: "Error",
          description: "Failed to load resume",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    checkUserAndFetchResume()
  }, [params.id, router, supabase, toast])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resume?")) return

    try {
      const { error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Resume deleted successfully",
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!resume) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/edit-resume/${resume.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Created {format(new Date(resume.created_at), "MMMM d, yyyy")}
                </p>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700">
                  {resume.content}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 