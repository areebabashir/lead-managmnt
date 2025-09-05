import JWT from "jsonwebtoken";
import userModel from "../models/authModel.js";

//Protected Routes token base
export const requireSignIn = async (req, res, next) => {
  try {
    // Check if authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header is required' 
      });
    }

    const token = req.headers.authorization.split(' ')[1];
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Bearer token is required' 
      });
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log('JWT Error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }
};

//admin acceess
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).populate('role', 'name');
    if (!user.isSuperAdmin && (!user.role || (user.role.name !== 'Admin' && user.role.name !== 'Super Admin'))) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middleware",
    });
  }
};