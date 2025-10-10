export const authMiddleware = (req, res, next) => {
  // Mock user object with a fake user ID
  req.user = { _id: 'mockUserId123' }; // Replace with a realistic user ID for testing
  next(); // Proceed to the next middleware or route handler
};