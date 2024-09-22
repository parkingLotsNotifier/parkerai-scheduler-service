const amqp = require('amqplib');

let channel = null;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost'); // Replace with your RabbitMQ server URL
    channel = await connection.createChannel();
    await channel.assertQueue('image_processing_queue', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
