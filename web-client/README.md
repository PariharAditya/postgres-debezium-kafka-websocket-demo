Web Client

A tiny Express static server that serves a simple page which connects to the WebSocket service.

Env (set via docker-compose):

- REACT_APP_WEBSOCKET_URL (default ws://localhost:3001)
- REACT_APP_API_URL (optional, default http://localhost:3001)

Start locally (optional):

1. npm install
2. npm start
