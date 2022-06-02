const express = require('express')
const app = express()
const port = 3001

app.use(express.json());
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

let requestCounter = 0;

app.get('/read', async (req, res) => {
    await delay();
    let data ;
    requestCounter++;

    if( requestCounter % 8 === 0 ) {
        data = {
            status: 'ok',
            cardId: '123-456',
        }
    } else {
        data = {
            status: 'not_ok',
        }
    }
    res.json(data);
});

app.post('/write', async (req, res) => {
    await delay();
    res.json({
        status: 'ok',
        payload: req.body
    });
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})