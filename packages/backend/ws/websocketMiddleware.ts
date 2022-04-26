import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from '../logging';

const baseUrl = process.env.NODE_ENV === 'development' ? 'ws://localhost:9001' : 'ws://spesialist';

export default () => ({
    getWebsocketProxy: () => {
        logger.info('Setting up websocket proxy');
        return createProxyMiddleware({
            target: baseUrl,
            ws: true,
            changeOrigin: true,
        });
    },
});
