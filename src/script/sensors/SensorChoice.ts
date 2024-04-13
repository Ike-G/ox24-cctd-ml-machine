import { writable } from 'svelte/store';

export enum SensorChoices {
   ACCEL,
   MAGNET,
   ACCELMAGNET
}

export const sensorChoiceKeys = (x: SensorChoices) => {
   switch (x) {
      case SensorChoices.ACCEL:
         return ['accx','accy','accz'];
      case SensorChoices.MAGNET:
         return ['magx','magy','magz'];
      case SensorChoices.ACCELMAGNET:
         return ['accx','accy','accz','magx','magy','magz'];
   }
}
