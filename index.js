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
        await db.collection('render').add({
            path,
            method,
            headers,
            body,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).send("Message envoyé avec succès");
    } catch (error) {
        console.log(`error ${error.message}`);
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
