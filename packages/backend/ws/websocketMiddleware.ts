import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from '../logging';
import config from '../config';
import url from 'url';
import { Request, Response } from 'http-proxy-middleware/dist/types';
import net from 'net';
import http from 'http';
import * as httpProxy from 'http-proxy';

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:9001' : config.server.spesialistBaseUrl;

export default () => ({
    getWebsocketProxy: () => {
        logger.info('Setting up websocket proxy');
        return createProxyMiddleware({
            target: baseUrl,
            ws: true,
            changeOrigin: true,
            onError: (err: Error, req: Request, res: Response, target?: string | Partial<url.Url>) =>
                logger.error('ws proxy error'),
            onClose: (proxyRes: Response, proxySocket: net.Socket, proxyHead: any) => logger.info('ws proxy close'),
            onOpen: (proxySocket: net.Socket) => logger.info('ws proxy open'),
            onProxyReq: (proxyReq: http.ClientRequest, req: Request, res: Response, options: httpProxy.ServerOptions) =>
                logger.info(
                    'ws proxy onProxyReq',
                    JSON.stringify(proxyReq),
                    JSON.stringify(req),
                    JSON.stringify(res),
                    JSON.stringify(options)
                ),
            onProxyReqWs: (
                proxyReq: http.ClientRequest,
                req: Request,
                socket: net.Socket,
                options: httpProxy.ServerOptions,
                head: any
            ) => logger.info('ws proxy onProxyReqWs'),
            onProxyRes: (proxyRes: http.IncomingMessage, req: Request, res: Response) =>
                logger.info('ws proxy onProxyRes', JSON.stringify(proxyRes), JSON.stringify(req), JSON.stringify(res)),
        });
    },
});
