export default async function handler(req, res) {
  let id = req.query?.id || req.query?.objectid;
  if (!id && req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      id = urlObj.searchParams.get('id') || urlObj.searchParams.get('objectid');
    } catch (_) {}
  }
  if (!id) {
    return res.status(400).json({ error: 'Missing objectid' });
  }

  try {
    const url = `https://api.geekdo.com/api/geekitems?objectid=${id}&objecttype=thing`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Geekdo error ${response.status}` });
    }

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

