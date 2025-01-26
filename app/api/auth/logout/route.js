export async function POST() {
  return new Response(null, {
    status: 200,
    headers: {
      'Set-Cookie': `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
    }
  });
} 