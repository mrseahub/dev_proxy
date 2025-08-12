import admin from 'firebase-admin';
import fetch from 'node-fetch';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    try {
        const { method, headers, body, query } = req;
        const path = '/' + (Array.isArray(query.slug) ? query.slug.join('/') : query.slug || '');

        // Логируем в Firestore
        await db.collection('vercel').add({
            path,
            method,
            headers,
            body,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Прокси на целевой URL
        const targetUrl = `https://development.airvat.dev${path}`;
        const fetchOptions = { method, headers: { ...headers } };

        if (method !== 'GET' && method !== 'HEAD') {
            fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
            fetchOptions.headers['Content-Type'] = 'application/json';
        }

        const proxyResponse = await fetch(targetUrl, fetchOptions);
        const text = await proxyResponse.text();

        res.status(proxyResponse.status).send(text);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
