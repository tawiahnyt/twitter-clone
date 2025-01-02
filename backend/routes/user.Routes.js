import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser } from "../controllers/user.Controllers.js";

const router = express.Router();

router.post('/profile/:username', protectRoute, getUserProfile)
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.get("/update", protectRoute, updateUser);


export default router;