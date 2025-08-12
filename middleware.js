export const config = {
  matcher: ['/api/:path*'],
  runtime: 'edge',
};

export default function middleware(req) {
  const { method, headers, path, body } = req;
  if (method === 'GET') {
    return new Response("ok", {
      status: 200
    });
  }

  console.log({
    path,
    method,
    headers,
    body,
    timestamp: Date.now(),
  });

  try {
    return new Response("Message envoyé avec succès", {
      status: 200
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
