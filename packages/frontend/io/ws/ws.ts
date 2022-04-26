import { useEffect } from 'react';

type WebsocketProtocol = 'ws' | 'wss';

const protocol: WebsocketProtocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';

const baseUrl: string = window.location.hostname + (process.env.NODE_ENV === 'development' ? ':3000' : '') + '/ws';

export const useWebSocketOpptegnelser = () => {
    useEffect(() => {
        const socket = new WebSocket(`${protocol}://${baseUrl}/opptegnelse`);
        socket.onopen = (event: Event) => {
            console.log('websocket open', JSON.stringify(event));
            socket.send('Speil åpnet websocket');
        };
        socket.onclose = (event: CloseEvent) => console.log('websocket close', JSON.stringify(event));
        socket.onmessage = (event: MessageEvent) => console.log('websocket message: ', JSON.stringify(event));
        socket.onerror = (event: Event) => console.error('websocket error', JSON.stringify(event));
        return () => {
            socket.close();
        };
    }, []);
};
