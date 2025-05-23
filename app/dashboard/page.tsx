'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Resume {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
}

export default function Dashboard() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setResumes(data || [])
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load resumes',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [router, supabase, toast])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to delete a resume',
          variant: 'destructive',
        })
        router.push('/login')
        return
      }

      console.log('Attempting to delete resume:', { id, userId: user.id })

      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Delete error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Resume deleted successfully:', id)
      setResumes(prevResumes => prevResumes.filter(resume => resume.id !== id))
      
      toast({
        title: 'Success',
        description: 'Resume deleted successfully',
      })
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete resume. Please try again.',
        variant: 'destructive',
      })
      // Refresh the resumes list in case of error
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setResumes(data || [])
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                <h1 className="text-xl font-bold text-gray-900">My Resumes</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/create-resume')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Resume
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {resumes.length === 0 ? (
            <div className="text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new resume.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/create-resume')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Resume
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link
                        href={`/resume/${resume.id}`}
                        className="hover:text-indigo-600"
                      >
                        {resume.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Created {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 