import { Router } from "express"
import {
  createAssignment,
  getAssignment,
  listAssignments,
  deleteAssignment,
} from "../controllers/assignment.controller"

const router = Router()

router.get("/",       listAssignments)
router.post("/",      createAssignment)
router.get("/:id",    getAssignment)
router.delete("/:id", deleteAssignment)

export default router