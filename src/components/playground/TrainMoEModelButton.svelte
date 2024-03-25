<!--
  (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->
 <script lang="ts">
    import StaticConfiguration from '../../StaticConfiguration';
    import Model from '../../script/domain/stores/Model';
    import MoEModelTrainer from '../../script/mlmodels/MoEModelTrainer';
    import { classifier } from '../../script/stores/Stores';
    import playgroundContext from './PlaygroundContext';
  
    const model: Model = classifier.getModel();
    const trainModelButtonClicked = () => {
      playgroundContext.addMessage('training model...');
      model
        .train(new MoEModelTrainer(StaticConfiguration.MoEModelTrainingSettings))
        .then(() => {
          playgroundContext.addMessage('Finished training!');
        });
    };
  </script>
  
  <button class="border-1 p-2 m-1" on:click={trainModelButtonClicked}
    >train MoE model!</button>