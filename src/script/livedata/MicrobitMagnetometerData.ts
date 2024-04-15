/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Subscriber, Unsubscriber, Writable, get, writable } from 'svelte/store';
import LiveDataBuffer from '../domain/LiveDataBuffer';
import LiveData from '../domain/stores/LiveData';

export type MicrobitMagnetometerData = {
  magx: number;
  magy: number;
  magz: number;
};

class MicrobitMagnetometerLiveData implements LiveData<MicrobitMagnetometerData> {
  private store: Writable<MicrobitMagnetometerData>;
  constructor(private dataBuffer: LiveDataBuffer<MicrobitMagnetometerData>) {
    this.store = writable({
      magx: 0,
      magy: 0,
      magz: 0,
    });
  }

  public getBuffer(): LiveDataBuffer<MicrobitMagnetometerData> {
    return this.dataBuffer;
  }

  public put(data: MicrobitMagnetometerData): void {
    this.store.set(data);
    this.dataBuffer.addValue(data);
  }

  public getSeriesSize(): number {
    return 3;
  }

  public getLabels(): string[] {
    return ['Mag-X', 'Mag-Y', 'Mag-Z'];
  }

  public getPropertyNames(): string[] {
    return Object.getOwnPropertyNames(get(this.store));
  }

  public subscribe(
    run: Subscriber<MicrobitMagnetometerData>,
    invalidate?: ((value?: MicrobitMagnetometerData | undefined) => void) | undefined,
  ): Unsubscriber {
    return this.store.subscribe(run, invalidate);
  }
}

export default MicrobitMagnetometerLiveData;
