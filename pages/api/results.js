import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'uid required' });
    const key = `results:${uid}`;
    const results = await redis.lrange(key, 0, -1);
    res.status(200).json(results.map(r => JSON.parse(r)));
}