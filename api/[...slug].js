import https from 'https';
import admin from 'firebase-admin';
import fetch from 'node-fetch';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
    });
}

const db = admin.firestore();

export default async function handler(req, res) {
    const { method, headers, body, query } = req;

    // Собираем путь из slug
    const path = Array.isArray(query.slug) ? query.slug.join('/') : query.slug || '';

    // Формируем URL для прокси
    const targetUrl = `https://development.airvat.dev/pablo/${path}`;

    try {
        // Делаем запрос, игнорируя self-signed сертификат
        const response = await fetch(targetUrl, {
            method,
            headers: { ...headers, host: undefined },
            body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
            agent: new https.Agent({ rejectUnauthorized: false })
        });

        const data = await response.text();

        // Логируем в Firestore
        await db.collection('vercel').add({
            path,
            method,
            headers,
            requestBody: body,
            responseBody: data,
            status: response.status,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Отдаём ответ клиенту
        res.status(200).send("Message envoyé avec succès");
    } catch (error) {
        console.error(error);

        await db.collection('vercel').add({
            path,
            method,
            headers,
            requestBody: body,
            error: error.message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(500).send({ error: error.message });
    }
}
