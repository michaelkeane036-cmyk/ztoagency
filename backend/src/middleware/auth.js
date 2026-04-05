const jwt = require('jsonwebtoken');

/**
 * Verifies the access token stored in the httpOnly cookie.
 * Attaches req.user = { id, email, role } on success.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

/**
 * Same as requireAuth but also enforces role === 'admin'.
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
