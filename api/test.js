export default function handler(req, res) {
    res.json({
        status: 'ok',
        message: 'Root API test working',
        env: process.env.NODE_ENV
    });
}
