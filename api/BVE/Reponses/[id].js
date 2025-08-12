import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
  });
}

const db = admin.firestore();

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  const { method, headers, body, url } = req;

  if (method === 'GET') {
    return res.status(200).send("ok");
  }

  try {
    await db.collection('vercel').add({
      path: url,
      method,
      headers,
      body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send("Message envoyé avec succès");
  } catch (err) {
    res.status(500).send(err.message);
  }
}
