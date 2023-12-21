const express = require('express');
require('dotenv').config()
const bodyParser = require('body-parser')
const indexRouter = require('./routes/index');
const { startSQSListener } = require('./services/sqsService');
const { handleMessage } = require('./helpers/sqsMessageHandler');

const PORT = process.env.PORT;

const app = express();

// sqs
startSQSListener(process.env.SQS_QUEUE_URL, handleMessage)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const apiRouter = require('./routes/api')

app.use('/', indexRouter);
// app.use('/api', apiRouter);

app.use((err, req, res, next) => {
    if (err) {
        console.error(err)
        return res.status(500).json({
            "errors": "Something Went Wrong",
            "success": "false"
        })
    }
    next(err)
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})