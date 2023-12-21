const handleMessage = async (message) => {
    // Your logic for processing the incoming message
    console.log('Received message:', JSON.parse(message.Body));
};

module.exports = { handleMessage }