import { useEffect } from 'react';

type WebsocketProtocol = 'ws' | 'wss';

const protocol: WebsocketProtocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';

const baseUrl: string = window.location.hostname + (process.env.NODE_ENV === 'development' ? ':3000' : '');

export const useWebSocketOpptegnelser = () => {
    useEffect(() => {
        const url = `${protocol}://${baseUrl}/ws/opptegnelse`;
        const socket = new WebSocket(url);
        socket.onopen = (event: Event) => {
            console.log('websocket open', event);
            socket.send('Speil åpnet websocket');
        };
        socket.onclose = (event: CloseEvent) => console.log('websocket close', event);
        socket.onmessage = (event: MessageEvent) => console.log('websocket message', event);
        socket.onerror = (event: Event) => console.error('websocket error', event);
        return () => {
            socket.close();
        };
    }, []);
};
