class SensorChoice {
  constructor(
    private accel: boolean,
    private magnet: boolean,
  ) {}
  public accelerometerSelected(): boolean {
    return this.accel;
  }

  public magnetometerSelected(): boolean {
    return this.magnet;
  }

  public choiceIds(): string[] {
    const ids: string[] = [];
    if (this.accel) ids.push('accelerometer');
    if (this.magnet) ids.push('magnetometer');
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
    return keys;
  }

  public validChoice(): boolean {
    return this.accel || this.magnet;
  }
}
export default SensorChoice;
