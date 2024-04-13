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