const express = require('express');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const https = require('https');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE)),
    });
}

const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res) => {
    try {
        const { method, headers, path, body } = req;
        if (method === 'GET') {
            return res.status(200).send("ok");
        }

        // Записываем в Firestore
        await db.collection('render').add({
            path,
            method,
            headers,
            body,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Прокси целевой URL
        const targetUrl = `https://development.airvat.dev${path}`;
        console.log('targetUrl', targetUrl);


        // fetch с правильной обработкой тела
        const fetchOptions = {
            method,
            headers: { ...headers },
            agent: httpsAgent,
        };

        if (method !== 'GET' && method !== 'HEAD') {
            if (typeof body === 'object') {
                fetchOptions.body = JSON.stringify(body);
                fetchOptions.headers['Content-Type'] = 'application/json';
            } else {
                fetchOptions.body = body;
            }
        }

        const proxyResponse = await fetch(targetUrl, fetchOptions);
        const text = await proxyResponse.text();

        res.status(proxyResponse.status).send(text);
    } catch (error) {
        console.log(`error ${error.message}`);
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
