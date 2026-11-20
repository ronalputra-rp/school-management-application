import express from "express";
import {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
} from "../controllers/class.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getClasses);
router.get("/:id", getClassById);
router.post("/", createClass);
router.patch("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
