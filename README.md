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

