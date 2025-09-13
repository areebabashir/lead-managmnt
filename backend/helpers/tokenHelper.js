import JWT from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = async (user) => {
    return JWT.sign(
        { 
            _id: user._id, 
            role: user.role?._id || user.role, // Only include role ID, not the full object
            name: user.name, 
            email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};
