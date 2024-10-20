const schedulerService = require('../services/schedulerService');

// /scheduler/scheduleTask
exports.scheduleTask = (req, res) => {
  const { parkingLotId, operationHours, intervalTime, cameras } = req.body;

  // Validate the required parameters including checking if every camera object has an id and url
  if (!operationHours || !intervalTime || !cameras || !Array.isArray(cameras) || cameras.some(camera => !camera.cameraId || !camera.cameraUrl)) {
    return res.status(400).json({ message: 'Missing or incorrect scheduling parameters.' });
  }
 
  try {
    schedulerService.scheduleTask(parkingLotId, operationHours, intervalTime, cameras);
   
    res.status(200).json({ message: 'Task scheduled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to schedule task', error: error.message });
  }
};

// /scheduler/cancelTask/:id
exports.cancelTask = (req, res) => {
  const { parkingLotId } = req.params;

  try {
    schedulerService.cancelTask(parkingLotId);
    res.status(200).json({ message: 'Task cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel task', error: error.message });
  }
};
