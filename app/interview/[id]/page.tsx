"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Send } from "lucide-react"

interface InterviewState {
  currentQuestion: string
  currentAnswer: string
  feedback: {
    strengths: string[]
    improvements: string[]
    overall: string
  } | null
  questions: string[]
  currentIndex: number
  isEvaluating: boolean
}

export default function InterviewPage({ params }: { params: { id: string } }) {
  const [resume, setResume] = useState<any>(null)
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentQuestion: "",
    currentAnswer: "",
    feedback: null,
    questions: [],
    currentIndex: 0,
    isEvaluating: false,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchResumeAndGenerateQuestions = async () => {
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

        // Generate interview questions based on resume
        const response = await fetch("/api/generate-interview-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeContent: data.content }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate questions")
        }

        const { questions } = await response.json()
        setInterviewState(prev => ({
          ...prev,
          questions,
          currentQuestion: questions[0],
        }))
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start interview",
          variant: "destructive",
        })
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchResumeAndGenerateQuestions()
  }, [params.id, router, supabase, toast])

  const handleSubmitAnswer = async () => {
    if (!interviewState.currentAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer",
        variant: "destructive",
      })
      return
    }

    setInterviewState(prev => ({ ...prev, isEvaluating: true }))

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: interviewState.currentQuestion,
          answer: interviewState.currentAnswer,
          resumeContent: resume.content,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate answer")
      }

      const feedback = await response.json()
      setInterviewState(prev => ({
        ...prev,
        feedback,
        isEvaluating: false,
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate answer",
        variant: "destructive",
      })
      setInterviewState(prev => ({ ...prev, isEvaluating: false }))
    }
  }

  const handleNextQuestion = () => {
    const nextIndex = interviewState.currentIndex + 1
    if (nextIndex < interviewState.questions.length) {
      setInterviewState(prev => ({
        ...prev,
        currentIndex: nextIndex,
        currentQuestion: prev.questions[nextIndex],
        currentAnswer: "",
        feedback: null,
      }))
    } else {
      toast({
        title: "Interview Complete",
        description: "You've completed all the questions!",
      })
      router.push("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your interview...</p>
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
                <h1 className="text-xl font-bold text-gray-900">AI Interview</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2 inline" />
                Exit Interview
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
                  <h2 className="text-lg font-medium text-gray-900">
                    Question {interviewState.currentIndex + 1} of {interviewState.questions.length}
                  </h2>
                  <p className="mt-2 text-gray-700">{interviewState.currentQuestion}</p>
                </div>

                <div>
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Answer
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="answer"
                      name="answer"
                      rows={6}
                      value={interviewState.currentAnswer}
                      onChange={(e) =>
                        setInterviewState(prev => ({
                          ...prev,
                          currentAnswer: e.target.value,
                        }))
                      }
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Type your answer here..."
                    />
                  </div>
                </div>

                {!interviewState.feedback ? (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={interviewState.isEvaluating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {interviewState.isEvaluating ? "Evaluating..." : "Submit Answer"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-green-800">Strengths</h3>
                      <ul className="mt-2 text-sm text-green-700 list-disc list-inside">
                        {interviewState.feedback.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-yellow-800">Areas for Improvement</h3>
                      <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                        {interviewState.feedback.improvements.map((improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md">
                      <h3 className="text-sm font-medium text-blue-800">Overall Feedback</h3>
                      <p className="mt-2 text-sm text-blue-700">
                        {interviewState.feedback.overall}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleNextQuestion}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {interviewState.currentIndex + 1 === interviewState.questions.length
                          ? "Finish Interview"
                          : "Next Question"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 