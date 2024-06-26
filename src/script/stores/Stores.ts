/**
 * (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import LocalStorageRepositories from '../repository/LocalStorageRepositories';
import PollingPredictorEngine from '../engine/PollingPredictorEngine';
import MicrobitAccelerometerLiveData, {
  MicrobitAccelerometerData,
} from '../livedata/MicrobitAccelerometerData';
import MicrobitMagnetometerLiveData, {
  MicrobitMagnetometerData,
} from '../livedata/MicrobitMagnetometerData';
import LiveDataBuffer from '../domain/LiveDataBuffer';
import StaticConfiguration from '../../StaticConfiguration';
import Repositories from '../domain/Repositories';
import Gestures from '../domain/stores/gesture/Gestures';
import Classifier from '../domain/stores/Classifier';
import Engine from '../domain/stores/Engine';
import LiveData from '../domain/stores/LiveData';
import CombinedLiveData from '../livedata/CombinedData';
import SensorChoice from '../sensors/SensorChoice';
import { Readable, derived } from 'svelte/store';
import MicrobitLightLiveData, { MicrobitLightData } from '../livedata/MicrobitLightData';
import PersistantWritable from '../repository/PersistantWritable';

const accel = new PersistantWritable(true, "accel-sensor-choice");
const magnet = new PersistantWritable(false, "magnet-sensor-choice");
const light = new PersistantWritable(false, "light-sensor-choice");
const sensorChoice: Readable<SensorChoice> = derived(
  [accel, magnet, light],
  ([a, m, l]) => new SensorChoice(a, m, l),
);

const repositories: Repositories = new LocalStorageRepositories();

const gestures: Gestures = new Gestures(repositories.getGestureRepository());
// Builds a classifier, which wraps the model so as to deal with updating gestures / filters
// Model itself wraps both mlModel (which provides the .predict(data) interface), and the training procedure
// We want to specify sensors at the training level, and have that carry over to each prediction.
// ATTEMPT 1: Doing this by modifying trainModel
const classifier: Classifier = repositories.getClassifierRepository().getClassifier();
sensorChoice.subscribe(() => classifier.getModel().markAsUntrained());

const accelerometerDataBuffer = new LiveDataBuffer<MicrobitAccelerometerData>(
  StaticConfiguration.accelerometerLiveDataBufferSize,
);
const liveAccelerometerData: LiveData<MicrobitAccelerometerData> =
  new MicrobitAccelerometerLiveData(accelerometerDataBuffer);

const magnetometerDataBuffer = new LiveDataBuffer<MicrobitMagnetometerData>(
  StaticConfiguration.magnetometerLiveDataBufferSize,
);
const liveMagnetometerData: LiveData<MicrobitMagnetometerData> =
  new MicrobitMagnetometerLiveData(magnetometerDataBuffer);

const lightDataBuffer: LiveDataBuffer<MicrobitLightData> =
  new LiveDataBuffer<MicrobitLightData>(StaticConfiguration.lightLiveDataBufferSize);
const liveLightData: LiveData<MicrobitLightData> = new MicrobitLightLiveData(
  lightDataBuffer,
);

const liveCombinedData: CombinedLiveData = new CombinedLiveData(
  liveAccelerometerData,
  liveMagnetometerData,
  liveLightData,
);

const engine: Engine = new PollingPredictorEngine(classifier, liveCombinedData);

// Export the stores here. Please be mindful when exporting stores, avoid whenever possible.
// This helps us avoid leaking too many objects, that aren't meant to be interacted with
// NEW: Reconsider whether liveAccelerometerData and liveMagnetometerData need to be exported
export {
  accel,
  magnet,
  light,
  engine,
  gestures,
  classifier,
  liveAccelerometerData,
  liveMagnetometerData,
  liveLightData,
  liveCombinedData,
  sensorChoice,
};
