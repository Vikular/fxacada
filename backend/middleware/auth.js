import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fxacada-secret';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || !['super-admin', 'limited-admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}
