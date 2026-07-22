import { put } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { uid, filename, data } = req.body; // data - base64
    if (!uid || !filename || !data) return res.status(400).json({ error: 'missing fields' });

    const buffer = Buffer.from(data, 'base64');
    const blob = await put(`${uid}/${filename}`, buffer, { access: 'public' });
    res.status(200).json({ url: blob.url });
}