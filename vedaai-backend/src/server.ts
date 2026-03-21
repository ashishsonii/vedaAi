import "dotenv/config"

import express   from "express"
import http      from "http"
import cors      from "cors"

import { connectDb }       from "./config/db"
import { initSocket }      from "./socket"
import assignmentRoutes    from "./routes/assignment.routes"

const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  allowedOrigins?.length
    ? cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
          }
          callback(null, false)
        },
      })
    : cors()
)
app.use(express.json())
app.use("/api/assignments", assignmentRoutes)

app.get("/", (_req, res) => res.send("VedaAI Backend Running 🚀"))

connectDb()

const server = http.createServer(app)
initSocket(server)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))