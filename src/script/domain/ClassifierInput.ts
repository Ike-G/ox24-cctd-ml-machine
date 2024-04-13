/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import SensorChoice from '../sensors/SensorChoice';
import Filters from './Filters';

interface ClassifierInput {
  getInput(filters: Filters, sensors: SensorChoice): number[];
}

export default ClassifierInput;
