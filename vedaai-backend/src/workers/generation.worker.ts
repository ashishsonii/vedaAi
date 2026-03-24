import dotenv from "dotenv"
dotenv.config()

import { Worker }           from "bullmq"
import { connectDb }        from "../config/db"
import { getRedisConnection }  from "../config/redis"
import { Assignment }       from "../models/assignment.model"
import { pub }              from "../events/eventBus"
import { buildPrompt, generateWithAI } from "../services/ai.service"

const publish = (payload: object) =>
  pub.publish("ASSIGNMENT_EVENTS", JSON.stringify(payload))

const startWorker = async () => {
  await connectDb()
  console.log("✅ DB Connected in Worker")

  new Worker(
    "assignment-generation",
    async (job) => {
      const { assignmentId } = job.data
      console.log("📋 Processing:", assignmentId)

      try {
        await publish({ type: "ASSIGNMENT_GENERATING", assignmentId, progress: 10 })

        const assignment = await Assignment.findById(assignmentId)
        if (!assignment) throw new Error(`Assignment ${assignmentId} not found`)

        const prompt = buildPrompt(assignment)

        await publish({ type: "ASSIGNMENT_GENERATING", assignmentId, progress: 40 })
        console.log("🤖 Calling Groq AI...")

        const result = await generateWithAI(prompt)

        await publish({ type: "ASSIGNMENT_GENERATING", assignmentId, progress: 80 })

        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "completed",
          result,
          error:  null,
        })

        await publish({ type: "ASSIGNMENT_COMPLETED", assignmentId })
        console.log("✅ Assignment completed:", assignmentId)

      } catch (error: any) {
        console.error("❌ Worker Error:", error.message)

        await Assignment.findByIdAndUpdate(assignmentId, {
          status: "failed",
          error:  error.message,
        })

        await publish({
          type: "ASSIGNMENT_FAILED",
          assignmentId,
          error: error.message,
        })
      }
    },
    {
      connection:  getRedisConnection(),
      concurrency: 1,
      stalledInterval: 240000, // 4 minutes (guarantees a check before Upstash's 5-min timeout)
      drainDelay: 240, // 4 minutes
      skipDelayCheck: true, // Stop polling for delayed jobs
    } as any
  )

  console.log("🚀 Worker Started")
}

startWorker()