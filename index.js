const express = require('express');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({}), // пустой объект
  });
}

const db = admin.firestore();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', async (req, res) => {
  try {
    const { method, headers, path, body } = req;

    // Записываем в Firestore
    await db.collection('netlify').add({
      path,
      method,
      headers,
      body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Прокси целевой URL
    const targetUrl = `https://development.airvat.dev${path}`;

    // fetch с правильной обработкой тела
    const fetchOptions = {
      method,
      headers: { ...headers },
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
    res.status(500).send(error.message);
  }
});

// Порт из Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
