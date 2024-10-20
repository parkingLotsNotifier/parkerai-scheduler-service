const axios = require('axios');
const schedulerService = require('../services/schedulerService');
const {API_GATEWAY_BASE_ADDRS} = require('../config/env');

// Fallback function to retrieve and schedule all tasks
async function retrieveAndScheduleAllTasks() {
  try {
    // Make a GET request to retrieve all scheduler tasks
    const response = await axios.get(`${API_GATEWAY_BASE_ADDRS}/data-management/schedulerTask/getAllSchedulerTask`);

    // Extract the tasks from the response data
    const schedulerTasks = response.data;

    // Check if schedulerTasks is an array
    if (Array.isArray(schedulerTasks)) {
      // Iterate over each task and schedule it
      schedulerTasks.forEach((task) => {
        schedulerService.scheduleTask(
          task.parkingLotId,
          task.operationHours,
          task.intervalTime,
          task.cameras
        );
      });
      console.log('Successfully retrieved and scheduled all tasks.');
    } else {
      console.error('Unexpected response format: schedulerTasks is not an array');
    }
  } catch (error) {
    console.error('Error retrieving scheduler tasks:', error.message);
  }
}

module.exports = {retrieveAndScheduleAllTasks}


