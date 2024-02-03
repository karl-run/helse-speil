import { Express } from 'express';
import expressWs, { Application } from 'express-ws';
import WebSocket from 'ws';

export const setUpWebSockets = (app: Express) => {
    const wsApp: Application = expressWs(app, undefined, { wsOptions: { clientTracking: true } }).app;
    wsApp.ws('/ws', (ws: WebSocket) => {
        console.info(`New websocket connection open by client `);

        ws.send(JSON.stringify({ data: 'hello' }));
    });
};
