const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE))
  });
}

const db = admin.firestore();

exports.proxyHandler = functions.https.onRequest(async (req, res) => {
  try {
    const headers = { ...req.headers };
    const method = req.method;
    const path = req.path || '/';
    const body = (method !== 'GET' && method !== 'HEAD') ? req.rawBody || JSON.stringify(req.body) : null;

    // Логируем в Firestore
    await db.collection("firebase").add({
      path,
      method,
      headers,
      body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Формируем url для проксирования
    const targetUrl = `https://development.airvat.dev${path.replace('/dev/BVE/', '/BVE/')}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;

    // Удаляем хост из заголовков, чтобы не конфликтовал
    delete headers.host;

    // Проксируем запрос
    const proxyResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseText = await proxyResponse.text();

    // Копируем заголовки ответа
    proxyResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(proxyResponse.status).send(targetUrl + "\n" + responseText);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});
