/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import StaticConfiguration from '../../StaticConfiguration';
import Filter from '../domain/Filter';
import { FilterType } from '../domain/FilterTypes';

export type FilterGraphType = {
  min: number;
  max: number;
};

class FilterGraphLimits {
  public static getFilterLimits(filter: Filter): { min: number; max: number } {
    const filterType = filter.getType();
    switch (filterType) {
      case FilterType.MAX:
        return {
          min: StaticConfiguration.liveGraphValueBounds.min,
          max: StaticConfiguration.liveGraphValueBounds.max,
        };
      case FilterType.MIN:
        return {
          min: StaticConfiguration.liveGraphValueBounds.min,
          max: StaticConfiguration.liveGraphValueBounds.max,
        };
      case FilterType.STD:
        return {
          min: 0,
          max:
            (StaticConfiguration.liveGraphValueBounds.max -
              StaticConfiguration.liveGraphValueBounds.min) /
            2,
        };
      case FilterType.PEAKS:
        return { min: 0, max: 10 };
      case FilterType.ACC:
        return { min: 0, max: 500 };
      case FilterType.MEAN:
        return {
          min: StaticConfiguration.liveGraphValueBounds.min,
          max: StaticConfiguration.liveGraphValueBounds.max,
        };
      case FilterType.ZCR:
        return { min: 0, max: 1 };
      case FilterType.RMS:
        return { min: 0, max: 3 };
    }
  }
}

export default FilterGraphLimits;
