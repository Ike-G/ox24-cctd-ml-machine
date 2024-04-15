import ClassifierInput from '../domain/ClassifierInput';
import Filters from '../domain/Filters';
import { FlatCombinedDataArray } from '../livedata/CombinedData';
import SensorChoice from '../sensors/SensorChoice';

class GeneralClassifierInput implements ClassifierInput {
  constructor(
    private record: FlatCombinedDataArray,
  ) {}

  // Reconsider whether to have this class include sensors in the argument or more widely
  getInput(filters: Filters, sensors: SensorChoice): number[] {
    return (sensors.choiceKeys() as (keyof typeof this.record)[]).reduce(
      (fxs: number[], sensor: keyof typeof this.record) =>
        fxs.concat(filters.compute(this.record[sensor])),
      [],
    );
    //return [
    //   ...filters.compute(this.xas),
    //   ...filters.compute(this.yas),
    //   ...filters.compute(this.zas),
    // ];
  }
}

export default GeneralClassifierInput;
