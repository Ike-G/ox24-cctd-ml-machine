/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import ClassifierInput from '../domain/ClassifierInput';
import Filters from '../domain/Filters';
import SensorChoice from '../sensors/SensorChoice';

class AccelerometerClassifierInput implements ClassifierInput {
  constructor(
    private xs: number[],
    private ys: number[],
    private zs: number[],
  ) {}

  getInput(filters: Filters, sensors: SensorChoice): number[] {
    return [
      ...filters.compute(this.xs),
      ...filters.compute(this.ys),
      ...filters.compute(this.zs),
    ];
  }
}

export default AccelerometerClassifierInput;
