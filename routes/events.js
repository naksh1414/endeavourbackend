import express from 'express';
import {handleAllEvent, handleEventById} from "../controllers/events.js";
const router = express.Router();

router.post("/allevents",handleAllEvent);
router.post("/event/:eventId", handleEventById);

export default router;