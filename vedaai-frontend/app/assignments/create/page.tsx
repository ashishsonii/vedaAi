"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useAssignmentStore, QuestionType, QuestionTypeRow } from "@/store/assignmentStore"
import { useWebSocket } from "@/hooks/useWebSocket"

const TYPE_OPTIONS: QuestionType[] = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False",
  "Fill in the Blanks",
]

export default function CreateAssignmentPage() {
  const router = useRouter()
  useWebSocket()

  const {
    form,
    formErrors,
    status,
    setFormField,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    submitAssignment,
    setCurrentId,
  } = useAssignmentStore()

  const [dragging, setDragging] = useState(false)

  const totalQuestions = form.questionTypes.reduce((s, r) => s + r.count, 0)
  const totalMarks = form.questionTypes.reduce((s, r) => s + r.count * r.marks, 0)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) setFormField("file", file)
    },
    [setFormField]
  )

  const handleSubmit = async () => {
    const id = await submitAssignment()
    if (id) {
      setCurrentId(id)
      router.push(`/assignments/${id}`)
    }
  }

  const isGenerating = status === "generating"

  return (
    <div className="min-h-screen bg-[#CECECE] md:bg-transparent flex flex-col">

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden flex items-center px-5 py-4 bg-[#CECECE] sticky top-0 z-30">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#E3E3E3] flex items-center justify-center mr-3 flex-shrink-0"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1C1C1E" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4M4 12L10 6M4 12L10 18" />
          </svg>
        </button>
        <h1
          className="flex-1 text-center text-[17px] font-[800] text-[#1C1C1E] mr-10 tracking-tight"
          style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
        >
          Create Assignment
        </h1>
      </div>

      {/* ── Desktop breadcrumb ── */}
      <div className="hidden md:flex items-center justify-between px-8 pt-6 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[14px] font-medium text-[#6B7280]">Assignment</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-white/50 transition-colors">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white" />
          </button>
          <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-4 py-1.5 rounded-full shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#FFE5D9] flex items-center justify-center overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=FFE5D9"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[14px] font-bold text-[#1C1C1E]">John Doe</span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Desktop title ── */}
      <div className="hidden md:block px-8 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          <h1 className="text-[28px] font-extrabold text-[#1C1C1E] tracking-tight">Create Assignment</h1>
        </div>
        <p className="text-[14px] text-[#9CA3AF] font-medium ml-[18px]">
          Set up a new assignment for your students
        </p>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-40 md:pb-16">

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto">
          <div className="h-1 bg-gray-200 rounded-full mb-8 overflow-hidden">
            <div className="h-full w-1/2 bg-gray-900 rounded-full transition-all duration-500" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">

          {/* Section Header */}
          <div>
            <h2 className="text-[20px] font-extrabold text-gray-900 tracking-tight font-['Plus_Jakarta_Sans']">
              Assignment Details
            </h2>
            <p className="text-[13px] text-gray-500 font-medium mt-1">
              Basic information about your assignment
            </p>
          </div>

          {/* File Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
            className={`border-2 border-dashed rounded-[20px] p-8 text-center cursor-pointer transition-all
              ${dragging ? "border-gray-400 bg-gray-100" : "border-gray-300 bg-[#F5F5F5] hover:border-gray-400"}`}
          >
            <input
              id="fileInput"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFormField("file", f)
              }}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-[14px] bg-white shadow-sm flex items-center justify-center">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#1C1C1E" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              {form.file ? (
                <p className="text-[14px] font-bold text-gray-800">{form.file.name}</p>
              ) : (
                <>
                  <p className="text-[15px] font-bold text-gray-900">
                    Choose a file or drag &amp; drop it here
                  </p>
                  <p className="text-[12px] text-gray-400 font-semibold tracking-wide uppercase" style={{ fontSize: 11 }}>
                    JPEG, PNG, upto 10MB
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="mt-2 px-7 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Browse Files
              </button>
            </div>
          </div>
          <p className="text-[13px] text-gray-500 text-center font-semibold -mt-2">
            Upload images of your preferred document/<br className="sm:hidden" />Image
          </p>

          {/* Due Date */}
          <div>
            <label
              className="block text-[15px] font-extrabold text-[#1C1C1E] mb-2"
              style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
            >
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                className={`w-full bg-white border rounded-full px-5 py-3.5 text-[14px] font-medium text-gray-400
                  outline-none focus:ring-2 focus:ring-gray-200 appearance-none pr-14
                  ${formErrors.dueDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                value={form.dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormField("dueDate", e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border-2 border-gray-300 flex items-center justify-center pointer-events-none">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </div>
            {formErrors.dueDate && (
              <p className="text-[12px] text-red-500 mt-1 pl-1 font-bold">{formErrors.dueDate}</p>
            )}
          </div>

          {/* Subject + Topic */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                className={`w-full bg-white border rounded-[16px] px-4 py-3.5 text-[14px] font-semibold text-gray-800
                  outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-400
                  ${formErrors.subject ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setFormField("subject", e.target.value)}
              />
              {formErrors.subject && (
                <p className="text-[12px] text-red-500 mt-1 pl-1 font-bold">{formErrors.subject}</p>
              )}
            </div>
            <div>
              <input
                className={`w-full bg-white border rounded-[16px] px-4 py-3.5 text-[14px] font-semibold text-gray-800
                  outline-none focus:ring-2 focus:ring-gray-200 placeholder-gray-400
                  ${formErrors.topic ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                placeholder="Topic / Chapter"
                value={form.topic}
                onChange={(e) => setFormField("topic", e.target.value)}
              />
              {formErrors.topic && (
                <p className="text-[12px] text-red-500 mt-1 pl-1 font-bold">{formErrors.topic}</p>
              )}
            </div>
          </div>

          {/* ── Question Types section ── */}
          <div>

            {/* MOBILE label */}
            <label
              className="md:hidden block text-[15px] font-extrabold text-[#1C1C1E] mb-4"
              style={{ fontStyle: "italic", fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
            >
              Question Type
            </label>

            {/* DESKTOP column headers */}
            {/*
                Layout must mirror every data row exactly:
                [flex-1 ~ dropdown col] [w-6 gap] [w-7 × col] [w-4 gap] [w-[112px] count col] [w-[112px] marks col]
            */}
            <div className="hidden md:flex items-center mb-2 pr-0">
              {/* "Question Type" — spans the dropdown + × area */}
              <div className="flex-1 min-w-0">
                <span
                  className="text-[14px] font-extrabold text-[#1C1C1E]"
                  style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
                >
                  Question Type
                </span>
              </div>
              {/* gap + × placeholder */}
              <div className="w-[44px] flex-shrink-0" />
              {/* No. of Questions header — exactly w-[112px] centred */}
              <div className="w-[112px] flex-shrink-0 text-center">
                <span className="text-[12.5px] font-semibold text-[#6B7280]">No. of Questions</span>
              </div>
              {/* Marks header */}
              <div className="w-[112px] flex-shrink-0 text-center">
                <span className="text-[12.5px] font-semibold text-[#6B7280]">Marks</span>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-3 md:space-y-[10px]">
              {form.questionTypes.map((row) => (
                <QuestionTypeRowComp
                  key={row.id}
                  row={row}
                  onTypeChange={(v) => updateQuestionType(row.id, "type", v)}
                  onCountChange={(v) => updateQuestionType(row.id, "count", v)}
                  onMarksChange={(v) => updateQuestionType(row.id, "marks", v)}
                  onRemove={() => removeQuestionType(row.id)}
                  canRemove={form.questionTypes.length > 1}
                />
              ))}
            </div>

            {formErrors.questionTypes && (
              <p className="text-[12px] text-red-500 mt-2 font-bold">{formErrors.questionTypes}</p>
            )}

            {/* Add Question Type */}
            <button
              type="button"
              onClick={addQuestionType}
              className="flex items-center gap-3 mt-5 text-[14px] font-extrabold text-[#1C1C1E] hover:opacity-75 transition-opacity"
              style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
            >
              <div className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M12 4v16m-8-8h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              Add Question Type
            </button>

            {/* Totals */}
            <div className="mt-6 space-y-1">
              <p
                className="text-[14px] font-medium text-[#1C1C1E] text-right"
                style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
              >
                Total Questions : <span className="font-bold">{totalQuestions}</span>
              </p>
              <p
                className="text-[14px] font-medium text-[#1C1C1E] text-right"
                style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
              >
                Total Marks : <span className="font-bold">{totalMarks}</span>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="pb-2">
            <label className="block text-[14px] font-extrabold text-gray-900 mb-2">
              Additional Information{" "}
              <span className="font-semibold text-gray-400">(For better output)</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                className="w-full bg-white border border-dashed border-gray-300 rounded-[16px] px-4 py-3.5 text-[13px]
                  text-gray-800 outline-none focus:ring-2 focus:ring-gray-200 resize-none pr-12 font-semibold placeholder-gray-400"
                placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                value={form.additionalInfo}
                onChange={(e) => setFormField("additionalInfo", e.target.value)}
              />
              <button className="absolute right-3.5 bottom-3.5 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg width="13" height="13" fill="#374151" viewBox="0 0 24 24">
                  <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92v3.08h2v-3.08A7 7 0 0019 11h-2z" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky footer: Previous / Next ── */}
      {/* Mobile: equal-width flex-1, bottom-[96px] gives breathing room above bottom nav */}
      {/* Desktop: auto-sized justify-between, pinned to bottom */}
      <div className="fixed bottom-[96px] left-0 right-0 md:left-[350px] md:bottom-0 z-20
        bg-[#CECECE] md:bg-transparent border-t border-gray-200/60 md:border-none
        px-5 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-0 md:justify-between">
        <button
          onClick={() => router.back()}
          className="flex-1 md:flex-none flex items-center justify-center gap-2
            py-[13px] md:py-3 px-0 md:px-6
            bg-white border border-gray-200 rounded-full
            text-[14px] font-extrabold text-gray-900 shadow-sm
            hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          ← Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isGenerating}
          className="flex-1 md:flex-none flex items-center justify-center gap-2
            py-[13px] md:py-3 px-0 md:px-6
            bg-[#1C1C1E] rounded-full
            text-[14px] font-extrabold text-white shadow-lg
            hover:bg-black active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Next →"
          )}
        </button>
      </div>

    </div>
  )
}

/* ─────────────────────────────────────────────
   QuestionTypeRowComp
   Mobile  → white card + gray inner stepper box
   Desktop → flat row: [pill dropdown] [×] [stepper] [stepper]
───────────────────────────────────────────── */
function QuestionTypeRowComp({
  row, onTypeChange, onCountChange, onMarksChange, onRemove, canRemove,
}: {
  row: QuestionTypeRow
  onTypeChange: (v: QuestionType) => void
  onCountChange: (v: number) => void
  onMarksChange: (v: number) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <>
      {/* ══ MOBILE card ══ */}
      <div className="md:hidden bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 mr-3">
            <select
              className="w-full text-[14px] font-semibold text-[#1C1C1E] bg-transparent outline-none appearance-none pr-8 cursor-pointer"
              style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
              value={row.type}
              onChange={(e) => onTypeChange(e.target.value as QuestionType)}
            >
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <svg className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {canRemove && (
            <button onClick={onRemove} className="text-[#9CA3AF] hover:text-gray-700 p-1 flex-shrink-0">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="bg-[#F0F0F0] rounded-[16px] p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] font-semibold text-[#9CA3AF] mb-2"
                style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}>
                No. of Questions
              </p>
              <Stepper value={row.count} min={1} max={50} onChange={onCountChange} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#9CA3AF] mb-2"
                style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}>
                Marks
              </p>
              <Stepper value={row.marks} min={1} max={20} onChange={onMarksChange} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ DESKTOP flat row ══
          Columns must match the header above exactly:
          [flex-1 dropdown] [w-6 chevron padding] [w-7 ×] [w-1 gap] [w-[112px] stepper] [w-[112px] stepper]
      */}
      <div className="hidden md:flex items-center">

        {/* Dropdown pill — flex-1 */}
        <div className="flex-1 min-w-0 relative">
          <div className="flex items-center bg-white border border-gray-200 rounded-full pl-4 pr-10 py-[9px] mr-3">
            <select
              className="w-full text-[13.5px] font-semibold text-[#1C1C1E] bg-transparent outline-none appearance-none cursor-pointer truncate"
              style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
              value={row.type}
              onChange={(e) => onTypeChange(e.target.value as QuestionType)}
            >
              {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* chevron sits inside the pill on the right */}
          <svg
            className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none"
            width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* × button — w-7, right-padded to match header gap */}
        <div className="w-7 flex-shrink-0 flex items-center justify-center mr-[17px]">
          {canRemove ? (
            <button
              onClick={onRemove}
              className="text-[#9CA3AF] hover:text-gray-600 transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            /* invisible spacer so layout stays consistent */
            <span className="w-4 h-4 block" />
          )}
        </div>

        {/* No. of Questions stepper — w-[112px] */}
        <div className="w-[112px] flex-shrink-0">
          <Stepper value={row.count} min={1} max={50} onChange={onCountChange} />
        </div>

        {/* Marks stepper — w-[112px] */}
        <div className="w-[112px] flex-shrink-0">
          <Stepper value={row.marks} min={1} max={20} onChange={onMarksChange} />
        </div>

      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   Stepper  —  white pill:  −  value  +
───────────────────────────────────────────── */
function Stepper({ value, min, max, onChange }: {
  value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-1 py-[3px]">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full flex items-center justify-center
          text-[#1C1C1E] font-medium text-[17px] hover:bg-gray-50 transition-colors flex-shrink-0 leading-none"
      >
        −
      </button>
      <span
        className="text-[14px] font-bold text-[#1C1C1E] min-w-[22px] text-center select-none"
        style={{ fontFamily: "var(--font-jakarta), Plus Jakarta Sans, sans-serif" }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full flex items-center justify-center
          text-[#1C1C1E] font-medium text-[17px] hover:bg-gray-50 transition-colors flex-shrink-0 leading-none"
      >
        +
      </button>
    </div>
  )
}