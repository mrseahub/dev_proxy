export const config = {
  matcher: ['/api/:path*'],
  runtime: 'edge',
};

export default function middleware(req) {
  const { method, headers, url, body } = req;
  if (method === 'GET') {
    return new Response("ok", {
      status: 200
    });
  }

  console.log({
    url,
    method,
    headers,
    body,
  });

  try {
    return new Response("Message envoyé avec succès", {
      status: 200
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
