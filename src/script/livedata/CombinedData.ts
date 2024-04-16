import { MicrobitAccelerometerData } from './MicrobitAccelerometerData';
import { MicrobitMagnetometerData } from './MicrobitMagnetometerData';
import { Subscriber, Unsubscriber, get, Readable, derived, Writable, writable } from 'svelte/store';
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

export type FlatCombinedDataArray = {
  accx: number[];
  accy: number[];
  accz: number[];
  magx: number[];
  magy: number[];
  magz: number[];
  light: number[];
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
  light: number;
};

class CombinedLiveData implements LiveData<FlatCombinedData> {
  private combinedStore: Writable<FlatCombinedData>;
  private dataBuffer: LiveDataBuffer<FlatCombinedData>;
  constructor(
    accelerometerData: LiveData<MicrobitAccelerometerData>,
    magnetometerData: LiveData<MicrobitMagnetometerData>,
    lightData: LiveData<MicrobitLightData>,
  ) {
    this.dataBuffer = new LiveDataBuffer(
      Math.min(
        StaticConfiguration.magnetometerLiveDataBufferSize,
        StaticConfiguration.accelerometerLiveDataBufferSize,
        StaticConfiguration.lightLiveDataBufferSize,
      ),
    );
    this.combinedStore = writable({
      accy: 0, accx: 0, accz: 0,
      magx: 0, magy: 0, magz: 0,
      light: 0,
    });

    // Not using derive since that seems to be broken? 
    // Maybe related to this: https://github.com/sveltejs/svelte/issues/3191
    const sync = () => {
      const acc = accelerometerData.getBuffer().getNewestValues(1)[0] ?? { accx: 0, accy: 0, accz: 0 };
      const mag = magnetometerData.getBuffer().getNewestValues(1)[0] ?? { magx: 0, magy: 0, magz: 0 };
      const light = lightData.getBuffer().getNewestValues(1)[0] ?? { l: 0 };
      const data: FlatCombinedData = {
        accy: acc.accy,
        accx: acc.accx,
        accz: acc.accz,
        magx: mag.magx,
        magy: mag.magy,
        magz: mag.magz,
        light: light.l,
      };
      this.dataBuffer.addValue(data);
      this.combinedStore.set(data)
    };

    accelerometerData.subscribe(() => sync());
    magnetometerData.subscribe(() => sync());
    lightData.subscribe(() => sync());
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
