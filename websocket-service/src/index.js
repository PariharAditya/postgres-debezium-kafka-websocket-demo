import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import pino from 'pino';
import { Kafka } from 'kafkajs';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const PORT = Number(process.env.PORT || 3001);
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:29092').split(',');
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || 'websocket-consumers';
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || 'orders.public.orders';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    logger.info({ count: clients.size }, 'Client connected');

    ws.on('close', () => {
        clients.delete(ws);
        logger.info({ count: clients.size }, 'Client disconnected');
    });
});

function broadcast(message) {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    for (const ws of clients) {
        if (ws.readyState === ws.OPEN) {
            ws.send(data);
        }
    }
}

async function run() {
    // Connect to Kafka
    const kafka = new Kafka({ brokers: KAFKA_BROKERS });
    const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });

    await consumer.connect();
    logger.info('Kafka consumer connected');

    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: true });
    logger.info({ topic: KAFKA_TOPIC }, 'Subscribed to topic');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const key = message.key ? message.key.toString() : null;
            const value = message.value ? message.value.toString() : null;
            const out = { topic, partition, key, value, ts: Date.now() };
            broadcast(out);
        },
    });

    server.listen(PORT, () => {
        logger.info({ port: PORT }, 'WebSocket service listening');
    });
}

run().catch((err) => {
    logger.error({ err }, 'Fatal error');
    process.exit(1);
});
