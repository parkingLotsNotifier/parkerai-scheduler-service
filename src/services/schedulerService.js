const schedule = require('node-schedule');
const { getChannel } = require('../config/rabbitmq');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  scheduleTask(parkingLotId, startAt, endAt, intervalTime) {
    const job = schedule.scheduleJob({ start: new Date(startAt), end: new Date(endAt), rule: `*/${intervalTime} * * * *` }, () => {
      this.triggerImageProcessing(parkingLotId);
    });

    this.jobs.set(parkingLotId, job);
  }

  cancelTask(parkingLotId) {
    const job = this.jobs.get(parkingLotId);
    if (job) {
      job.cancel();
      this.jobs.delete(parkingLotId);
    }
  }

  async triggerImageProcessing(parkingLotId) {
    const channel = getChannel();
    if (channel) {
      await channel.sendToQueue('image_processing_queue', Buffer.from(JSON.stringify({ parkingLotId })));
      console.log(`Triggered image processing for parking lot ${parkingLotId}`);
    } else {
      console.error('RabbitMQ channel not available');
    }
  }
}

module.exports = new SchedulerService();
