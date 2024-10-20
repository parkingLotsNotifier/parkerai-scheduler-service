const cron = require('node-cron');
const moment = require('moment');
const { getChannel } = require('../config/rabbitmq');
const { QUEUE_NAME } = require('../config/env');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  scheduleTask(parkingLotId, operationHours, intervalTime, cameras) {
    // Cancel existing tasks for this parking lot
    this.cancelTask(parkingLotId);
    const { value, unit } = this.parseIntervalTime(intervalTime);

    Object.keys(operationHours).forEach((day) => {
      const { startingAt, endingAt } = operationHours[day];

      if (startingAt && endingAt) {
        const startMoment = moment(startingAt, 'HH:mm');
        const endMoment = moment(endingAt, 'HH:mm');

        // Adjust end time if necessary
        if (endMoment.isBefore(startMoment)) {
          endMoment.add(1, 'day');
        }

        // Generate cron expression based on intervalTime and operation hours
        const cronExpression = this.generateCronExpression(
          value,
          unit,
          startMoment,
          endMoment,
          day
        );

        console.log(
          `Scheduling job for parking lot ${parkingLotId} on ${day} with cron expression: ${cronExpression}`
        );

        // Validate cron expression
        if (!cron.validate(cronExpression)) {
          console.error(`Invalid cron expression: ${cronExpression}`);
          return;
        }

        const task = cron.schedule(
          cronExpression,
          async () => {
            try {
              await this.sendToQueue(parkingLotId, cameras);
              console.log(
                `Job executed for parking lot ${parkingLotId} on ${day}`
              );
            } catch (error) {
              console.error(
                `Error executing job for parking lot ${parkingLotId} on ${day}:`,
                error
              );
            }
          },
        );

        this.jobs.set(`${parkingLotId}-${day}`, task);
      } else {
        console.log(
          `Skipping scheduling for ${day} as time intervals are not defined.`
        );
      }
    });

    console.log('Current scheduled jobs:', Array.from(this.jobs.keys()));
  }

  generateCronExpression(value, unit, startMoment, endMoment, day) {
    const dayOfWeek = this.getDayOfWeek(day);
  
    if (endMoment.isBefore(startMoment)) {
      endMoment.add(1, 'day');
    }
  
    const startHour = startMoment.hour();
    const endHour = endMoment.hour();
  
    let cronExpression = '';
  
    switch (unit) {
      case 's':
        // Every 'value' seconds during all minutes of the specified hours
        cronExpression = `*/${value} * ${startHour}-${endHour} * * ${dayOfWeek}`;
        break;
      case 'm':
        // Every 'value' minutes during the specified hours
        cronExpression = `0 */${value} ${startHour}-${endHour} * * ${dayOfWeek}`;
        break;
      case 'h':
        // Every 'value' hours during the specified day
        cronExpression = `0 0 */${value} * * ${dayOfWeek}`;
        break;
      default:
        throw new Error('Invalid interval unit');
    }
  
    return cronExpression;
  }

  cancelTask(parkingLotId) {
    let jobsCancelled = false;
    for (const [key, task] of this.jobs.entries()) {
      if (key.startsWith(`${parkingLotId}-`)) {
        task.stop();
        this.jobs.delete(key);
        jobsCancelled = true;
        console.log(`Cancelled job for key: ${key}`);
      }
    }
    if (!jobsCancelled) {
      console.log(`No jobs found for parking lot ID: ${parkingLotId}`);
    }
  }

  async sendToQueue(parkingLotId, cameras) {
    const channel = getChannel();
    if (channel) {
      await channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify({ parkingLotId, cameras }))
      );
      console.log(
        `Scheduled tasks for parking lot ${parkingLotId} with cameras details sent to queue.`
      );
    } else {
      console.error('RabbitMQ channel not available');
    }
  }

  getDayOfWeek(day) {
    return [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ].indexOf(day.toLowerCase());
  }

  parseIntervalTime(intervalTime) {
    const match = intervalTime.match(/^(\d+)([smh])$/);
    if (!match) {
      throw new Error('Invalid interval time format');
    }
    return { value: parseInt(match[1], 10), unit: match[2] };
  }
}

module.exports = new SchedulerService();
