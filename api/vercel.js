import admin from 'firebase-admin';
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    const { method, headers, path, body } = req;
    if (method === 'GET') {
        return res.status(200).send("ok");
    }
    await db.collection('vercel').add({
        path,
        method,
        headers,
        body,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send("Message envoyé avec succès");
}