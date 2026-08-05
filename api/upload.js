import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const password = process.env.ADMIN_PASSWORD;
  const { auth, fileType, fileData } = req.body;

  if (auth !== password) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const allowedTypes = ['logo', 'banner', 'sound'];
  if (!allowedTypes.includes(fileType)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  let fileName, contentType;
  const buffer = Buffer.from(fileData, 'base64');

  if (fileType === 'logo') {
    fileName = 'image.png';
    contentType = 'image/png';
  } else if (fileType === 'banner') {
    fileName = 'banner.jpg';
    contentType = 'image/jpeg';
  } else if (fileType === 'sound') {
    fileName = 'screaming_girl.mp3';
    contentType = 'audio/mpeg';
  }

  try {
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: contentType,
    });

    res.status(200).json({ success: true, url: blob.url });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
}
