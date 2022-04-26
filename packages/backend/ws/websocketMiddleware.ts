import config from '../config';
import { createProxyMiddleware } from 'http-proxy-middleware';

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9001' : config.server.spesialistBaseUrl;

export default () => ({
    getWebsocketProxy: () => {
        return createProxyMiddleware({
            target: baseUrl,
            ws: true,
            changeOrigin: true,
        });
    },
});
