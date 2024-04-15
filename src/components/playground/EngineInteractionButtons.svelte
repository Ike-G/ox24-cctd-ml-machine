<!--
  (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->
<script lang="ts">
  import Gesture from '../../script/domain/stores/gesture/Gesture';
  import AccelerometerClassifierInput from '../../script/mlmodels/AccelerometerClassifierInput';
  import GeneralClassifierInput from '../../script/mlmodels/GeneralClassifierInput';
  import { classifier, engine, gestures } from '../../script/stores/Stores';
  import playgroundContext from './PlaygroundContext';
  import TrainKnnModelButton from './TrainKNNModelButton.svelte';
  import TrainLayersModelButton from './TrainLayersModelButton.svelte';

  const getRandomGesture = (): Gesture => {
    return gestures.getGestures()[
      Math.floor(Math.random() * gestures.getNumberOfGestures())
    ];
  };

  const predictButtonClicked = () => {
    const randGesture = getRandomGesture();
    playgroundContext.addMessage(
      'Predicting on random recording of: ' + randGesture.getName(),
    );
    const input = new GeneralClassifierInput({
      accx: randGesture.getRecordings()[0].data.accx,
      accy: randGesture.getRecordings()[0].data.accy,
      accz: randGesture.getRecordings()[0].data.accz,
      magx: randGesture.getRecordings()[0].data.magx,
      magy: randGesture.getRecordings()[0].data.magy,
      magz: randGesture.getRecordings()[0].data.magz,
      light: randGesture.getRecordings()[0].data.light,
    });
    classifier.classify(input).then(() => {
      playgroundContext.addMessage('Finished predicting');
    });
  };
</script>

<TrainLayersModelButton />
<TrainKnnModelButton />
<button class="border-1 p-2 m-1 hover:(font-bold)" on:click={predictButtonClicked}
  >Predict random gesture!</button>
<button
  class="border-1 p-2 m-1 hover:(font-bold)"
  on:click={() => {
    playgroundContext.addMessage('Starting engine');
    engine.start();
  }}>Start engine!</button>
<button
  class="border-1 p-2 m-1 hover:(font-bold)"
  on:click={() => {
    playgroundContext.addMessage('Stopping engine');
    engine.stop();
  }}>Stop engine!</button>
