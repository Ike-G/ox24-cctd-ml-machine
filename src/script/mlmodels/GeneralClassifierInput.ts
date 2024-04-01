import ClassifierInput from '../domain/ClassifierInput';
import Filters from '../domain/Filters';
import { SensorChoices, sensorChoiceKeys } from '../SensorChoice';

class GeneralClassifierInput implements ClassifierInput {
  constructor(
    private record: {
      accx: number[];
      accy: number[];
      accz: number[];
      magx: number[];
      magy: number[];
      magz: number[];
    },
  ) {}

  // Reconsider whether to have this class include sensors in the argument or more widely
  getInput(filters: Filters, sensors: SensorChoices): number[] {
    return (sensorChoiceKeys(sensors) as (keyof typeof this.record)[]).reduce(
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
