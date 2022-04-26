import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from '../logging';

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9001' : 'http://spesialist';

export default () => ({
    getWebsocketProxy: () => {
        logger.info('Setting up websocket proxy');
        return createProxyMiddleware('/', {
            target: baseUrl,
            ws: true,
            changeOrigin: true,
        });
    },
});
