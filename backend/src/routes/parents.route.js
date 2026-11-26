import express from "express";
import {
    getParents,
    addParents,
    updatingParents,
    deletingParents,
} from "../controllers/parent.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getParents);
router.post("/", addParents);
router.patch("/:id", updatingParents);
router.delete("/:id", deletingParents);

export default router;
