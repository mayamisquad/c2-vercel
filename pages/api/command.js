import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { uid, command } = req.body;
    if (!uid || !command) return res.status(400).json({ error: 'uid and command required' });

    const cmdObj = { command_id: Date.now(), command };
    await redis.rpush(`commands:${uid}`, JSON.stringify(cmdObj));
    res.status(200).json({ success: true, command_id: cmdObj.command_id });
}