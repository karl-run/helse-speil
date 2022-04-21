import { useEffect } from 'react';

type WebsocketProtocol = 'ws' | 'wss';

const protocol: WebsocketProtocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';

const baseUrl: string = (process.env.NODE_ENV === 'development' ? 'localhost:3000' : window.location) + '/ws';

export const useWebSocketOpptegnelser = () => {
    useEffect(() => {
        const socket = new WebSocket(`${protocol}://${baseUrl}/opptegnelse`);
        socket.onopen = () => {
            console.log('websocket open');
            socket.send('Speil åpnet websocket');
        };
        socket.onclose = (event: CloseEvent) => console.log('websocket close', event.reason);
        socket.onmessage = (event: MessageEvent) => console.log('websocket message: ', event.data);
        return () => {
            socket.close();
        };
    }, []);
};
