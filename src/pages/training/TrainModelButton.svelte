<!--
  (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->

<script lang="ts">
  import { t } from '../../i18n';
  import { classifier, sensorChoice } from '../../script/stores/Stores';
  import LayersModelTrainer from '../../script/mlmodels/LayersModelTrainer';
  import MoEModelTrainer from '../../script/mlmodels/MoEModelTrainer';
  import StaticConfiguration from '../../StaticConfiguration';
  import StandardDropdownButton from '../../components/buttons/StandardDropdownButton.svelte';
  import KNNModelTrainer from '../../script/mlmodels/KNNModelTrainer';
  import { DropdownOption } from '../../components/buttons/Buttons';
  import PersistantWritable from '../../script/repository/PersistantWritable';
  import ModelTrainer from '../../script/domain/ModelTrainer';
  import MLModel from '../../script/domain/MLModel';
  import { Feature, hasFeature } from '../../script/FeatureToggles';
  import StandardButton from '../../components/buttons/StandardButton.svelte';
  import { LossTrainingIteration } from '../../components/graphs/LossGraphUtil';
  import { Writable } from 'svelte/store';

  export let onTrainingIteration: (iteration: LossTrainingIteration) => void;
  export let onClick: () => void;
  export let maxX: Writable<number>;

  type ModelEntry = {
    id: string;
    title: string;
    label: string;
    maxX: number;
    trainer: () => ModelTrainer<MLModel>;
  };

  export const availableModels: ModelEntry[] = [
    {
      id: 'NN',
      title: 'Neural network',
      label: 'neural network',
      maxX: StaticConfiguration.layersModelTrainingSettings.noOfEpochs,
      trainer: () =>
        new LayersModelTrainer(StaticConfiguration.layersModelTrainingSettings, h => {
          onTrainingIteration(h);
        }),
    },
    {
      id: 'KNN',
      title: 'KNN',
      label: 'KNN',
      maxX: 0,
      trainer: () => new KNNModelTrainer(StaticConfiguration.knnNeighbourCount),
    },
    {
      id: 'MoE',
      title: 'Mixture of Experts',
      label: 'mixture of experts',
      maxX: StaticConfiguration.MoEModelTrainingSettings.noOfEpochs,
      trainer: () => new MoEModelTrainer(StaticConfiguration.MoEModelTrainingSettings, h => {
          onTrainingIteration(h);
        }),
    },
  ];

  const model = classifier.getModel();

  $: trainButtonLabel = !$model.hasModel
    ? 'menu.trainer.trainModelButton'
    : 'menu.trainer.trainNewModelButton';

  $: trainButtonSimpleLabel = !$model.hasModel
    ? 'menu.trainer.trainModelButtonSimple'
    : 'menu.trainer.trainNewModelButtonSimple';

  const defaultModel: ModelEntry | undefined = availableModels.find(
    model => model.id === 'NN',
  );
  if (!defaultModel) {
    throw new Error('Default model not found!');
  }

  const getModelFromOption = (dropdownOption: DropdownOption) => {
    const modelFound: ModelEntry | undefined = availableModels.find(
      model => model.id === dropdownOption.id,
    );
    if (!modelFound) {
      throw new Error('Model not found!');
    }
    return modelFound;
  };

  const selectedOption = new PersistantWritable<DropdownOption>(
    {
      id: defaultModel.id,
      label: defaultModel.label,
    },
    'prefferedModel',
  );

  const clickHandler = () => {
    const selectedModel = availableModels.find(model => model.id === $selectedOption.id);

    if (selectedModel) {
      onClick();
      maxX.set(selectedModel.maxX);
      model.train(selectedModel.trainer(), $sensorChoice);
    }
  };

  const onSelect = (option: DropdownOption) => {
    selectedOption.set(option);
  };

  const options: DropdownOption[] = availableModels.map(model => {
    return {
      id: model.id,
      label: model.title,
    };
  });
</script>

{#if hasFeature(Feature.KNN_MODEL)}
  <StandardDropdownButton
    onClick={clickHandler}
    {onSelect}
    buttonText={$t(trainButtonLabel, {
      values: { model: getModelFromOption($selectedOption).label },
    })}
    defaultOptionSelected={$selectedOption}
    {options} />
{:else}
  <StandardButton onClick={clickHandler}>
    {$t(trainButtonSimpleLabel)}
  </StandardButton>
{/if}
