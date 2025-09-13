import express from "express";

import {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  updateProfileController,
} from "../controllers/authController.js";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddlewares.js";
//router object
const router = express.Router();

//get all user


//routing
//REGISTER || METHOD POST
router.post("/register", registerController);


//LOGIN 
router.post("/login", loginController);

//forget passworrd || post
router.post("/ForgetPassword", forgotPasswordController);
//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected route auth
//user
router.get("/user-auth", requireSignIn, async (req, res) => {
  try {
    // Get user with populated role and permissions
    const auth = (await import('../models/authModel.js')).default;
    const user = await auth.findById(req.user._id)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      })
      .select('-password -answer');

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "User authenticated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('User auth error:', error);
    res.status(500).send({
      success: false,
      message: "Error authenticating user"
    });
  }
});
//adminn
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", updateProfileController);




export default router;