import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '5mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { uid, command_id, output, screenshot } = req.body;

    const resultObj = {
        command_id,
        output: output || '',
        screenshot: screenshot || null,
        time: Date.now()
    };
    const key = `results:${uid}`;
    await redis.lpush(key, JSON.stringify(resultObj));
    await redis.ltrim(key, 0, 19);

    res.status(200).send('OK');
}