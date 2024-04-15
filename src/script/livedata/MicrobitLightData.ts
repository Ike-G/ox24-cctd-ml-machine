/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Subscriber, Unsubscriber, Writable, get, writable } from 'svelte/store';
import LiveDataBuffer from '../domain/LiveDataBuffer';
import LiveData from '../domain/stores/LiveData';

export type MicrobitLightData = {
  l: number;
};

class MicrobitLightLiveData implements LiveData<MicrobitLightData> {
  private store: Writable<MicrobitLightData>;
  constructor(private dataBuffer: LiveDataBuffer<MicrobitLightData>) {
    this.store = writable({
      l: 0,
    });
  }

  public getBuffer(): LiveDataBuffer<MicrobitLightData> {
    return this.dataBuffer;
  }

  public put(data: MicrobitLightData): void {
    this.store.set(data);
    this.dataBuffer.addValue(data);
  }

  public getSeriesSize(): number {
    return 1;
  }

  public getLabels(): string[] {
    return ['L'];
  }

  public getPropertyNames(): string[] {
    return Object.getOwnPropertyNames(get(this.store));
  }

  public subscribe(
    run: Subscriber<MicrobitLightData>,
    invalidate?: ((value?: MicrobitLightData | undefined) => void) | undefined,
  ): Unsubscriber {
    return this.store.subscribe(run, invalidate);
  }
}

export default MicrobitLightLiveData;
