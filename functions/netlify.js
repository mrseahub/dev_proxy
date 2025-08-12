const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const headers = event.headers;
    const body = event.body;
    const method = event.httpMethod;
    const path = event.path;
    if(method === 'GET'){
      return { statusCode: 200, body: "" };
    }

    await db.collection("netlify").add({
      path,
      method,
      headers,
      body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    const originalPath = path || '/';
    const targetUrl = `https://development.airvat.dev${originalPath.replace('/dev/BVE/', '/BVE/')}`;

    const proxyRes = await fetch(targetUrl, {
      method,
      headers,
      body,
    }).then(r=>r.text());

    return {
      statusCode: 200,
      body: targetUrl + "\n" + proxyRes,
    };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};