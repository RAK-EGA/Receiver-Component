const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const sendSQSMessage = async (queueUrl, messageBody) => {
    const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(messageBody),
    });

    return sqs.send(command);
};

const startSQSListener = (queueUrl, messageHandler) => {
    const params = {
        QueueUrl: queueUrl,
        AttributeNames: ['All'],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: ['All'],
        VisibilityTimeout: 30,
        WaitTimeSeconds: 20, // Long polling
    };

    const poll = async () => {
        try {
            const command = new ReceiveMessageCommand(params);
            const data = await sqs.send(command);

            if (data.Messages) {
                for (const message of data.Messages) {
                    // Call the provided message handler for processing the message
                    await messageHandler(message);

                    // Delete the processed message from the queue
                    const deleteParams = {
                        QueueUrl: queueUrl,
                        ReceiptHandle: message.ReceiptHandle,
                    };

                    const deleteCommand = new DeleteMessageCommand(deleteParams);
                    await sqs.send(deleteCommand);
                }
            }
        } catch (error) {
            console.error('Error receiving message from SQS:', error);
        } finally {
            // Continue polling for new messages
            setTimeout(poll, 0);
        }
    };

    // Start the initial polling
    poll();
};

// Export SQS instance if needed in other modules
module.exports = { sendSQSMessage, startSQSListener, sqs };