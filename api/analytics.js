import { put, get } from '@vercel/blob';
import { createHash } from 'crypto';

export default async function handler(req, res) {
  const password = process.env.ADMIN_PASSWORD;

  // GET: Fetch analytics (for admin panel)
  if (req.method === 'GET') {
    const { auth } = req.query;
    if (auth !== password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { blob } = await get('analytics.json');
      const data = blob ? JSON.parse(blob) : { visits: [], screams: 0 };
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
    return;
  }

  // POST: Log a visit or prank trigger
  if (req.method === 'POST') {
    const { triggered, userAgent, referrer } = req.body;

    // Get IP from headers
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const hashedIp = createHash('sha256').update(ip).digest('hex');

    try {
      const { blob } = await get('analytics.json');
      let data = blob ? JSON.parse(blob) : { visits: [], screams: 0 };

      const entry = {
        timestamp: new Date().toISOString(),
        ipHash: hashedIp,
        userAgent: userAgent || 'Unknown',
        referrer: referrer || 'Direct',
        triggered: triggered || false,
      };

      data.visits.unshift(entry);
      if (data.visits.length > 1000) data.visits = data.visits.slice(0, 1000);

      if (triggered) data.screams = (data.screams || 0) + 1;

      await put('analytics.json', JSON.stringify(data), {
        access: 'public',
        contentType: 'application/json',
      });

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to log analytics' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
