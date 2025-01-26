import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(userData) {
  const token = await new SignJWT(userData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
  
  return token;
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Add this new function for API route authentication
export async function authenticateUser(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
} 