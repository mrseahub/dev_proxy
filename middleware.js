import https from 'https';

export const config = {
  matcher: ['/api/:path*'],
  runtime: 'edge',
};

export default async function middleware(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, ''); // Убираем /api из пути

  // Формируем целевой URL
  const targetUrl = `https://development.airvat.dev/pablo${path}`;

  // Создаём агент для игнорирования self-signed сертификатов
  const agent = new https.Agent({ rejectUnauthorized: false });

  // Формируем опции для fetch
  const fetchOptions = {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers.entries()),
      host: 'development.airvat.dev', // Устанавливаем правильный host
    },
    body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : null,
    agent,
  };

  try {
    // Выполняем запрос к целевому серверу
    const proxyResponse = await fetch(targetUrl, fetchOptions);

    // Формируем ответ
    const responseText = await proxyResponse.text();

    // Возвращаем проксированный ответ
    return new Response(responseText, {
      status: 200,
      headers: proxyResponse.headers,
    });
  } catch (error) {
    // Обрабатываем ошибки
    return new Response(error.message, { status: 500 });
  }
}
