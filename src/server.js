const express = require('express');
const schedulerController = require('./controllers/schedulerController');
const { connectRabbitMQ } = require('./config/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware to parse JSON requests
app.use(express.json());

// Scheduler routes
app.post('/scheduleTask', schedulerController.scheduleTask);
app.delete('/cancelTask/:parkingLotId', schedulerController.cancelTask);

// Connect to RabbitMQ and start the server
async function startService() {
  try {
    await connectRabbitMQ();
    app.listen(PORT, () => {
      console.log(`Scheduler Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Scheduler Service:', error);
    process.exit(1);
  }
}

startService();
