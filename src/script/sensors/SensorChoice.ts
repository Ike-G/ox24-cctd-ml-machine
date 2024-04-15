class SensorChoice {
  constructor(
    private accel: boolean,
    private magnet: boolean,
    private light: boolean,
  ) {}
  public accelerometerSelected(): boolean {
    return this.accel;
  }

  public magnetometerSelected(): boolean {
    return this.magnet;
  }

  public lightSelected(): boolean {
   return this.light;
 }

  public choiceIds(): string[] {
    const ids: string[] = [];
    if (this.accel) ids.push('accelerometer');
    if (this.magnet) ids.push('magnetometer');
    if (this.light) ids.push('light');
    return ids;
  }

  public choiceKeys(): string[] {
    let keys: string[] = [];
    if (this.accel) {
      keys = keys.concat(['accx', 'accy', 'accz']);
    }
    if (this.magnet) {
      keys = keys.concat(['magx', 'magy', 'magz']);
    }
    if (this.light) {
      keys.push('light');
    }
    return keys;
  }

  public validChoice(): boolean {
    return this.accel || this.magnet || this.light;
  }
}
export default SensorChoice;
