"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAssignmentStore } from "@/store/assignmentStore"
import { useWebSocket } from "@/hooks/useWebSocket"
import Header from "@/components/Header"
import ExamPaper from "@/components/ExamPaper"

export default function AssignmentResultPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useWebSocket()

  const { status, progress, error, currentAssignment, setCurrentId, fetchAssignment, reset } =
    useAssignmentStore()

  useEffect(() => {
    if (!id) return
    setCurrentId(id)
    fetchAssignment(id)
  }, [id, setCurrentId, fetchAssignment])

  if (status === "completed" && currentAssignment?.result) {
    return (
      <div className="min-h-screen bg-[#CECECE] md:bg-transparent pb-24 md:pb-8">
        <div className="hidden md:block">
          <Header title="Assignment" showBack />
        </div>
        <ExamPaper
          assignment={currentAssignment}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#CECECE] md:bg-transparent">
      <div className="hidden md:block">
        <Header title="Assignment" showBack />
      </div>
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-sm w-full px-6">
          {status === "failed" ? (
            <FailedState error={error} onBack={() => router.push("/assignments")} />
          ) : (
            <GeneratingState progress={progress} />
          )}
        </div>
      </div>
    </div>
  )
}

function GeneratingState({ progress }: { progress: number }) {
  const steps = [
    { label: "Connecting to AI",       threshold: 10 },
    { label: "Analysing requirements", threshold: 30 },
    { label: "Structuring sections",   threshold: 40 },
    { label: "Generating questions",   threshold: 70 },
    { label: "Validating output",      threshold: 80 },
    { label: "Finalising paper",       threshold: 100 },
  ]
  const step = steps.filter((s) => progress >= s.threshold).pop()

  return (
    <div className="space-y-8">
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-900 animate-spin" />
        <div className="absolute inset-3 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-600 text-xl">✦</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[12px] text-gray-400">
          <span>{step?.label ?? "Starting..."}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-bold text-gray-900 mb-2 font-['Plus_Jakarta_Sans']">
          Generating your paper
        </h2>
        <p className="text-[13px] text-gray-500">
          Groq AI is crafting your questions. Usually takes 5–15 seconds.
        </p>
      </div>
    </div>
  )
}

function FailedState({ error, onBack }: { error: string | null; onBack: () => void }) {
  return (
    <div className="space-y-5">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-50 border border-red-100
        flex items-center justify-center">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>
      <div>
        <h2 className="text-[18px] font-bold text-gray-900 mb-2">Generation Failed</h2>
        {error && (
          <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 font-mono">
            {error}
          </p>
        )}
      </div>
      <button
        onClick={onBack}
        className="px-6 py-2.5 bg-gray-900 text-white text-[13px] font-semibold
          rounded-xl hover:bg-gray-800 transition-colors"
      >
        ← Back to Assignments
      </button>
    </div>
  )
}