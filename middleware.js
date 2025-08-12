export const config = {
  matcher: ['/api/:path*'],
  runtime: 'edge',
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
  });
}

const db = admin.firestore();

export default async function middleware(req) {
  const { method, headers, path, body } = req;
  if (method === 'GET') {
    return new Response("ok", {
      status: 200
    });
  }

  try {
    await db.collection('vercel').add({
      path,
      method,
      headers,
      body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return new Response("Message envoyé avec succès", {
      status: 200
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
