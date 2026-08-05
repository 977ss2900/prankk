import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
  const password = process.env.ADMIN_PASSWORD;

  // GET: Fetch current config
  if (req.method === 'GET') {
    try {
      const { blob } = await get('config.json');
      const config = blob ? JSON.parse(blob) : null;
      res.status(200).json(config || {});
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch config' });
    }
    return;
  }

  // POST: Save config (requires password)
  if (req.method === 'POST') {
    const { auth, ...data } = req.body;
    if (auth !== password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const config = {
        title: data.title || 'Universal Institute Kottakkal',
        welcomeMessage: data.welcomeMessage || 'Welcome To Universal',
        ogTitle: data.ogTitle || 'Universal Institute Kottakkal',
        ogDescription: data.ogDescription || 'The best coaching institute in Malabar. Visit us today!',
        delay: parseInt(data.delay) || 2,
        duration: parseInt(data.duration) || 10,
        logoUrl: data.logoUrl || '/image.png',
        bannerUrl: data.bannerUrl || 'https://universalinstitute.in/uploadpics/Banner_1744789755.jpg',
        soundUrl: data.soundUrl || '/screaming_girl.mp3',
      };

      await put('config.json', JSON.stringify(config), {
        access: 'public',
        contentType: 'application/json',
      });

      res.status(200).json({ success: true, config });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save config' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
