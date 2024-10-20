const express = require("express");
const axios = require("axios");
const schedulerController = require("./src/controllers/schedulerController");
const {retrieveAndScheduleAllTasks} = require("./src/helpers/fallback");
const { connectRabbitMQ } = require("./src/config/rabbitmq");
const app = express();
const { PORT } = require("./src/config/env");
const cors = require("cors");

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3002",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow standard HTTP methods
    allowedHeaders: "Content-Type,Authorization", // Allow specific headers
    credentials: true, // Allow credentials like cookies
    exposedHeaders: ["Authorization"], // Expose additional headers if needed
    maxAge: 600, // Cache the preflight request for 10 minutes
  })
);

// Scheduler routes
app.post("/scheduler/scheduleTask", schedulerController.scheduleTask);
app.delete("/scheduler/cancelTask/:parkingLotId", schedulerController.cancelTask);

// Connect to RabbitMQ and start the server
async function startService() {
  try {
    await connectRabbitMQ();
    app.listen(PORT,'0.0.0.0' , async () => {
      console.log(`Scheduler Service is running on port ${PORT}`);
      
      await retrieveAndScheduleAllTasks();
    });
  } catch (error) {
    console.error("Failed to start Scheduler Service:", error);
    process.exit(1);
  }
}

startService();


