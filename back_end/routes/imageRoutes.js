import express from "express";
import verifyJWT from "../middleware/verifyJWT.js";
import {
  uploadImage,
  uploadAvatar,
  getAvatar,
  deleteAvatar,
  imageAsAMessage,
} from "../controller/imageController.js";
const router = express.Router();
router.use(verifyJWT);

router
  .route("/avatar/:id")
  .get(getAvatar)
  .delete(deleteAvatar)
  .post(uploadImage.single("uploadavatar"), uploadAvatar);

router
  .route("/sendimage")
  .post(uploadImage.single("sendimage"), imageAsAMessage);

export default router;
