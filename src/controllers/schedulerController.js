const schedulerService = require('../services/schedulerService');

exports.scheduleTask = (req, res) => {
  const { parkingLotId, startAt, endAt, intervalTime } = req.body;

  schedulerService.scheduleTask(parkingLotId, startAt, endAt, intervalTime);

  res.status(200).json({ message: 'Task scheduled successfully' });
};

exports.cancelTask = (req, res) => {
  const { parkingLotId } = req.params;

  schedulerService.cancelTask(parkingLotId);

  res.status(200).json({ message: 'Task cancelled successfully' });
};
