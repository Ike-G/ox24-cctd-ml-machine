/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SensorChoices } from '../SensorChoice';
import Filters from './Filters';

interface ClassifierInput {
  getInput(filters: Filters, sensors: SensorChoices): number[];
}

export default ClassifierInput;
