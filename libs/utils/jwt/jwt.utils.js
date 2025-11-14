// libs/utils/jwt/jwt.utils.js
const jwt = require('jsonwebtoken');

class JWTUtils {
  /**
   * Generate JWT token
   * @param {Object} payload - Data to include in the token
   * @param {string} secret - Secret key for signing
   * @param {string} expiresIn - Token expiration time
   * @returns {string} Signed JWT token
   */
  static generateToken(payload, secret, expiresIn = '1h') {
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @param {string} secret - Secret key for verification
   * @returns {Object|null} Decoded token payload or null if invalid
   */
  static verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Data to include in the token
   * @param {string} secret - Secret key for signing
   * @param {string} expiresIn - Token expiration time (longer than access token)
   * @returns {string} Signed refresh token
   */
  static generateRefreshToken(payload, secret, expiresIn = '7d') {
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Decode JWT token without verification
   * @param {string} token - JWT token to decode
   * @returns {Object|null} Decoded token payload or null if invalid
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token to check
   * @param {string} secret - Secret key for verification
   * @returns {boolean} True if token is expired, false otherwise
   */
  static isTokenExpired(token, secret) {
    const decoded = this.verifyToken(token, secret);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < Math.floor(Date.now() / 1000);
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @param {string} secret - Secret key
   * @returns {number|null} Expiration timestamp or null if invalid
   */
  static getTokenExpiration(token, secret) {
    const decoded = this.verifyToken(token, secret);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return decoded.exp;
  }

  /**
   * Get token payload
   * @param {string} token - JWT token
   * @param {string} secret - Secret key
   * @returns {Object|null} Token payload or null if invalid
   */
  static getTokenPayload(token, secret) {
    return this.verifyToken(token, secret);
  }
}

module.exports = JWTUtils;