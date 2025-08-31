const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const route = require('./routes');
require('./db/index.js');



dotenv.config();

const app = express();
app.use(express.json());
app.use(cors('*'));

app.use('/api', route);

app.get('/', (req, res)=>{
    return res.status(200).json({status : 'success', message : 'app is listening'})
});

app.use((err, req, res, next)=>{
    return res.status(404).json({status : 'error', message : err.message})
})

process.on("SIGINT", ()=>{
    console.log('gracefuly shutDown the server');
    process.exit(0);
});

process.on("SIGTERM", ()=>{
    console.log('gracefuly shutDown the server');
    process.exit(0);
});

const PORT = process.env.PORT;
const listener = app.listen(PORT, ()=>{
    console.log(`app is listening on ${listener.address().port}`);
    
})
