/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Subscriber, Unsubscriber, Writable, get, writable } from 'svelte/store';
import LiveDataBuffer from '../domain/LiveDataBuffer';
import LiveData from '../domain/stores/LiveData';

export type MicrobitAccelerometerData = {
  accx: number;
  accy: number;
  accz: number;
};

class MicrobitAccelerometerLiveData implements LiveData<MicrobitAccelerometerData> {
  private store: Writable<MicrobitAccelerometerData>;
  constructor(private dataBuffer: LiveDataBuffer<MicrobitAccelerometerData>) {
    this.store = writable({
      accx: 0,
      accy: 0,
      accz: 0,
    });
  }

  public getBuffer(): LiveDataBuffer<MicrobitAccelerometerData> {
    return this.dataBuffer;
  }

  public put(data: MicrobitAccelerometerData): void {
    this.store.set(data);
    this.dataBuffer.addValue(data);
  }

  public getSeriesSize(): number {
    return 3;
  }

  public getLabels(): string[] {
    return ['Acc-X', 'Acc-Y', 'Acc-Z'];
  }

  public getPropertyNames(): string[] {
    return Object.getOwnPropertyNames(get(this.store));
  }

  public subscribe(
    run: Subscriber<MicrobitAccelerometerData>,
    invalidate?: ((value?: MicrobitAccelerometerData | undefined) => void) | undefined,
  ): Unsubscriber {
    return this.store.subscribe(run, invalidate);
  }
}

export default MicrobitAccelerometerLiveData;
