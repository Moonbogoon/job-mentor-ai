"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface AIResumeModalProps {
  onGenerate: (content: string) => void
}

export function AIResumeModal({ onGenerate }: AIResumeModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobTitle, setJobTitle] = useState("")
  const [experience, setExperience] = useState("")
  const [skills, setSkills] = useState("")
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!jobTitle || !experience || !skills) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          experience,
          skills,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate resume")
      }

      const data = await response.json()
      onGenerate(data.content)
      setOpen(false)
      
      toast({
        title: "Success",
        description: "Resume generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Resume with AI</DialogTitle>
          <DialogDescription>
            Fill in your details below to generate a professional resume draft.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="jobTitle" className="text-sm font-medium">
              Job Title
            </label>
            <input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="experience" className="text-sm font-medium">
              Experience Summary
            </label>
            <textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Briefly describe your work experience..."
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="skills" className="text-sm font-medium">
              Key Skills
            </label>
            <textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="List your key skills, separated by commas..."
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {loading ? "Generating..." : "Generate Resume"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 