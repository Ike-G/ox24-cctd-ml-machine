/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Readable,
  Subscriber,
  Unsubscriber,
  Writable,
  derived,
  get,
  writable,
} from 'svelte/store';
import { TrainerConsumer } from '../../repository/LocalStorageClassifierRepository';
import MLModel from '../MLModel';
import ModelTrainer from '../ModelTrainer';
import SensorChoice from '../../sensors/SensorChoice';

export enum TrainingStatus {
  Untrained,
  InProgress,
  Success,
  Failure,
}

export enum ModelType {
  LAYERS,
}

type BaseModelData = {
  trainingStatus: TrainingStatus;
  sensors: SensorChoice;
};

export type ModelData = {
  isTraining: boolean;
  isTrained: boolean;
  hasModel: boolean;
} & BaseModelData;

class Model implements Readable<ModelData> {
  private modelData: Writable<BaseModelData>;

  constructor(
    private trainerConsumer: TrainerConsumer,
    private mlModel: Readable<MLModel | undefined>,
  ) {
    this.modelData = writable({
      trainingStatus: TrainingStatus.Untrained,
      sensors: new SensorChoice(false, false),
    });
  }

  public async train<T extends MLModel>(
    modelTrainer: ModelTrainer<T>,
    sensors: SensorChoice,
  ): Promise<void> {
    this.modelData.update(state => {
      state.trainingStatus = TrainingStatus.InProgress;
      return state;
    });
    try {
      await this.trainerConsumer(modelTrainer); // Pass the current state of chosenSensors here
      this.modelData.update(state => {
        state.trainingStatus = TrainingStatus.Success;
        state.sensors = sensors;
        return state;
      });
    } catch (err) {
      this.modelData.update(state => {
        state.trainingStatus = TrainingStatus.Failure;
        return state;
      });
      console.error(err);
    }
  }

  /**
   * Whether a model has been trained successfully.
   */
  public isTrained(): boolean {
    return get(this.modelData).trainingStatus === TrainingStatus.Success;
  }

  /**
   * @returns the sensor data which the model accesses.
   */
  public getSensors(): SensorChoice {
    return get(this.modelData).sensors;
  }

  /**
   * Returns true if a MLModel is specified. Returns false if MLModel is undefined. Note canPredict may be true, even if isTrained() is false.
   */
  public hasModel(): boolean {
    return get(this.mlModel) !== undefined;
  }

  /**
   * Marks the model as untrained. If model was previously trained, the predict method will still work, because the model doesn't get dropped
   */
  public markAsUntrained(): void {
    this.modelData.update(updater => {
      updater.trainingStatus = TrainingStatus.Untrained;
      return updater;
    });
  }

  public isTraining(): boolean {
    return get(this.modelData).trainingStatus === TrainingStatus.InProgress;
  }

  /**
   * Manually perform a prediction using an array of numbers as input values. Returns an array of confidences with size equivalent to the number of gestures.
   *
   * Use if you have to, but see `classifier.classify()` first
   */
  public async predict(inputData: number[]): Promise<number[]> {
    const mlModel = get(this.mlModel);
    if (!mlModel) {
      throw new Error('Cannot predict, no MLModel has been specified');
    }
    return await mlModel.predict(inputData);
  }

  public subscribe(
    run: Subscriber<ModelData>,
    invalidate?: ((value?: ModelData | undefined) => void) | undefined,
  ): Unsubscriber {
    const derivedStore = derived([this.modelData, this.mlModel], stores => {
      const inputStore = stores[0];
      const mlModelStore = stores[1];
      return {
        sensors: inputStore.sensors,
        trainingStatus: inputStore.trainingStatus,
        isTraining: inputStore.trainingStatus === TrainingStatus.InProgress,
        hasModel: mlModelStore !== undefined,
        isTrained: inputStore.trainingStatus === TrainingStatus.Success,
      };
    });
    return derivedStore.subscribe(run, invalidate);
  }
}

export default Model;
