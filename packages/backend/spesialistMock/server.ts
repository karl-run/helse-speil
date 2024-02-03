import express from 'express';

import { sleep } from '../devHelpers';
import { setUpFaro } from './faro';
import { setUpGraphQLMiddleware } from './graphql';
import { setUpWebSockets } from './websocket';

const app = express();
const port = 9001;

const passeLenge = () => {
    const minimumforsinkelse = Math.random() > 0.8 ? 200 : 100;
    const varians = Math.random() * 50;
    return Math.round(minimumforsinkelse + varians);
};

app.disable('x-powered-by');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:1234');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, fodselsnummer',
    );
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE');
    const ventetid = passeLenge();
    const pathOrQuery: string = req.url === '/graphql' ? req.body['operationName'] : req.url;
    console.log(`Behandler ${req.method} til ${pathOrQuery} etter ${ventetid} ms`);
    sleep(ventetid).then(next);
});

setUpFaro(app);
setUpGraphQLMiddleware(app);

setUpWebSockets(app);

app.listen(port, () => console.log(`Spesialist-mock kjører på port ${port}`));
