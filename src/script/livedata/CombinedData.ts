import { MicrobitAccelerometerData } from './MicrobitAccelerometerData';
import { MicrobitMagnetometerData } from './MicrobitMagnetometerData';
import {
  Subscriber,
  Unsubscriber,
  get,
  Readable,
  derived,
} from 'svelte/store';
import LiveData from '../domain/stores/LiveData';
import LiveDataBuffer from '../domain/LiveDataBuffer';
import StaticConfiguration from '../../StaticConfiguration';
import { MicrobitLightData } from './MicrobitLightData';

export type FlatCombinedData = {
  accx: number;
  accy: number;
  accz: number;
  magx: number;
  magy: number;
  magz: number;
  light: number;
};

export type CombinedData = {
  accel: {
    x: number;
    y: number;
    z: number;
  };
  magnet: {
    x: number;
    y: number;
    z: number;
  };
  light: number
};

class CombinedLiveData implements LiveData<FlatCombinedData> {
  private combinedStore: Readable<FlatCombinedData>;
  private dataBuffer: LiveDataBuffer<FlatCombinedData>;
  constructor(
    accelerometerData: LiveData<MicrobitAccelerometerData>,
    magnetometerData: LiveData<MicrobitMagnetometerData>,
    lightData: LiveData<MicrobitLightData>
  ) {
    this.dataBuffer = new LiveDataBuffer(
      Math.min(
        StaticConfiguration.magnetometerLiveDataBufferSize,
        StaticConfiguration.accelerometerLiveDataBufferSize,
      ),
    );
    this.combinedStore = derived([accelerometerData, magnetometerData, lightData], ([a, m, l]) => {
      const data = { accx: a.x, accy: a.y, accz: a.z, magx: m.x, magy: m.y, magz: m.z, light: l.l };
      this.dataBuffer.addValue(data);
      return data;
    });
  }
  public getBuffer(): LiveDataBuffer<FlatCombinedData> {
    return this.dataBuffer;
  }
  public put(data: FlatCombinedData): void {
    void data;
    throw new Error(
      "This isn't a method that should really be implemented here, the live data is entirely derived internally and isn't subject to external modification.",
    );
  }
  public getSeriesSize(): number {
    return 7;
  }
  public getLabels(): string[] {
    return ['Acc-X', 'Acc-Y', 'Acc-Z', 'Mag-X', 'Mag-Y', 'Mag-Z', 'L']; // TODO: Make these labels smaller / more imformative
  }
  public getPropertyNames(): string[] {
    return Object.getOwnPropertyNames(get(this.combinedStore));
  }
  public subscribe(
    run: Subscriber<FlatCombinedData>,
    invalidate?: ((value?: FlatCombinedData | undefined) => void) | undefined,
  ): Unsubscriber {
    return this.combinedStore.subscribe(run, invalidate);
  }
}

export default CombinedLiveData;
