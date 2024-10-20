const amqp = require("amqplib");
const { QUEUE_NAME, ADDRS } = require("./env");

let channel = null;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(ADDRS);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };
