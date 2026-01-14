import jwt from "jsonwebtoken";

class TokenService {
  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "15m", 
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      {
        expiresIn: "7d", 
      }
    );
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
    } catch (error) {
      return null;
    }
  }
}

export default new TokenService();
