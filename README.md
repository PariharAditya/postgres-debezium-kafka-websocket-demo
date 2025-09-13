- [Redis Pub/Sub Glossary](https://redis.io/glossary/pub-sub/)
+- [Long Polling, WebSockets, and Server-Sent Events (Karan Pratap Singh)](https://www.karanpratapsingh.com/courses/system-design/long-polling-websockets-server-sent-events)
</p>

---

## References & Further Reading

- [IBM: Change Data Capture](https://www.ibm.com/think/topics/change-data-capture)
- [Difference in CDC vs Trigger (SQLServerCentral)](https://www.sqlservercentral.com/forums/topic/difference-in-cdc-vs-trigger)
- [Redis Pub/Sub Glossary](https://redis.io/glossary/pub-sub/)

## Why Kafka and Not Redis Pub/Sub?

When building a real-time system that must reliably notify clients of every database change, the choice of messaging technology is critical. Here’s why I chose **Apache Kafka** over **Redis Pub/Sub**:

- **Reliability:** Kafka stores every message on disk, so if a client disconnects or the system restarts, no updates are lost. Redis Pub/Sub does not persist messages—if a client is offline, it misses updates forever.
- **Delivery Guarantees:** Kafka provides at-least-once (and even exactly-once) delivery, ensuring every change is delivered. Redis Pub/Sub only offers “at-most-once” delivery, so messages can be lost.
- **Scalability:** Kafka is designed for high throughput and can handle thousands of clients and millions of messages per second. Redis Pub/Sub is simple but not built for large-scale, mission-critical systems.
- **Ecosystem:** Kafka integrates seamlessly with tools like Debezium for Change Data Capture (CDC), making it easy to stream database changes in real time.

**In summary:**  
If you need a simple, fast notification system where occasional data loss is okay, Redis Pub/Sub is fine. But for a robust, production-grade system where every update matters, Kafka is the clear choice.

> For a deep-dive architectural comparison and more details, see the research section at the end of this README.

# Real-Time Orders Update System

## Overview

This project is a hands-on example of how to build a real-time system where clients (like a web browser) instantly receive updates whenever data in a database changes. There is no polling—everything is event-driven and efficient.

**Tech Stack:**

- PostgreSQL (database)
- Debezium (change data capture)
- Kafka (event streaming)
- Node.js (WebSocket backend)
- WebSocket (real-time push to clients)
- Simple browser client (shows updates)

---

## How It Works (Step by Step)

1. **Database (PostgreSQL):**

   - Stores an `orders` table with fields: `id`, `customer_name`, `product_name`, `status`, `updated_at`.
   - Any insert, update, or delete in this table should trigger a real-time update to clients.

2. **Debezium (Kafka Connect):**

   - Watches the `orders` table for changes using PostgreSQL's logical replication.
   - Streams every change (insert/update/delete) as an event to Kafka.

3. **Kafka:**

   - Acts as a message broker. All changes to the `orders` table are published to a Kafka topic (`orders.public.orders`).
   - This makes the system scalable and decoupled.

4. **Node.js WebSocket Service:**

   - Connects to Kafka and listens for new events on the `orders.public.orders` topic.
   - Runs a WebSocket server. When a new event arrives, it pushes the update to all connected clients instantly.

5. **Web Client (Browser):**
   - Connects to the WebSocket server.
   - Displays every update in real time as soon as it happens in the database.

---

## Why This Approach?

- **No polling:** Clients don’t keep asking the server for updates. They just wait for a push.
- **Scalable:** Kafka and WebSocket can handle many clients and lots of updates.
- **Efficient:** Only changed data is sent, and only to connected clients.
- **Modular:** Each part (DB, CDC, broker, backend, client) can be swapped or scaled independently.

---

## How to Run (Step by Step)

1. **Clone or download this project.**

2. **Start all services:**

   ```sh
   docker compose up -d --build
   ```

   This will start Postgres, Debezium, Kafka, the Node.js backend, and the web client.

3. **Open the web client:**

   - Go to [http://localhost:3000](http://localhost:3000) in your browser.

4. **Open Adminer to modify the database:**

   - Go to [http://localhost:8081](http://localhost:8081)
   - System: PostgreSQL
   - Server: postgres
   - Username: postgres
   - Password: password
   - Database: orders_db

5. **Test real-time updates:**

   - In Adminer, insert, update, or delete rows in the `orders` table.
   - You should see updates appear instantly in the web client (no refresh needed).

6. **(Optional) View raw Kafka events:**
   - Go to [http://localhost:8080](http://localhost:8080) (Kafka UI)
   - Find the topic `orders.public.orders` to see the raw change events.

---

## File Structure

```
NodeProject/
  docker-compose.yml
  register-orders-connector.json
  database/
    init.sql
  web-client/
    Dockerfile, server.js, public/index.html, ...
  websocket-service/
    Dockerfile, src/index.js, ...
```

---

## How Each Part Works (For Newbies)

- **PostgreSQL:**

  - A popular open-source database. We use it to store orders.
  - Logical replication lets Debezium "see" every change.

- **Debezium:**

  - A tool that watches the database for changes and streams them out as events.
  - It’s like a "change detector" for your database.

- **Kafka:**

  - A message broker. Think of it as a super-fast, reliable post office for events.
  - Debezium sends every change to Kafka, and other services (like Node.js) can "subscribe" to those changes.

- **Node.js WebSocket Service:**

  - Listens to Kafka for new events.
  - Runs a WebSocket server so browsers can connect and get updates instantly.
  - When a new event comes in, it sends it to all connected browsers.

- **Web Client:**
  - A simple web page that connects to the WebSocket server.
  - Shows every update as soon as it happens in the database.

<p align="center">
  <img src="Screenshot 2025-09-13 162855.png" alt="Web client UI - connected" width="350"/>
  <img src="Screenshot 2025-09-13 162913.png" alt="Adminer SQL insert" width="350"/>
  <img src="Screenshot 2025-09-13 163005.png" alt="Kafka UI topic view" width="350"/>
  <img src="Screenshot 2025-09-13 163013.png" alt="Web client showing update" width="350"/>
</p>
