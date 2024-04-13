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

class SensorChoice {
   constructor(private accel: boolean,
               private magnet: boolean
      ) {}
   public accelerometerSelected(): boolean {
      return this.accel;
   }
   public magnetometerSelected(): boolean {
      return this.magnet;
   }
   public choiceKeys(): string[] {
      let keys: string[] = [];
      if (this.accel) {
         keys = keys.concat(['accx','accy','accz']);
      }
      if (this.magnet) {
         keys = keys.concat(['magx', 'magy', 'magz']);
      }
      return keys;
   }
   public validChoice(): boolean {
      return this.accel || this.magnet;
   }
}
export default SensorChoice;