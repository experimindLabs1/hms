import { jwtVerify, SignJWT } from 'jose';

export async function verifyToken(token) {
  try {
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    try {
      const { payload } = await jwtVerify(token, secret);
      return {
        success: true,
        id: payload.id,
        role: payload.role,
        employeeId: payload.employeeId
      };
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return { success: false, error: 'Invalid token' };
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false, error: error.message };
  }
}

export async function signToken(payload) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);
  return token;
}
