import config from '../config';
import { createProxyMiddleware } from 'http-proxy-middleware';

const baseUrl = process.env.NODE_ENV === 'development' ? 'ws://localhost:9001' : 'ws://spesialist';

export default () => ({
    getWebsocketProxy: () => {
        return createProxyMiddleware({
            target: baseUrl,
            ws: true,
            changeOrigin: true,
        });
    },
});
