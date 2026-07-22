import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    const key = `commands:${uid}`;
    const commands = await redis.lrange(key, 0, -1);
    await redis.del(key);
    const parsed = commands.map(cmd => JSON.parse(cmd));
    res.status(200).json(parsed);
}