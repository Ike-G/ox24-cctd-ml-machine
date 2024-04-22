<!-- (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->

<script lang="ts">
  import StaticConfiguration from '../../StaticConfiguration';
  import {
    liveAccelerometerData,
    liveMagnetometerData,
    liveLightData
  } from '../../script/stores/Stores';
  import LiveGraph from './LiveGraph.svelte';
  import LiveData from '../../script/domain/stores/LiveData';
  import SensorChoice from '../../script/sensors/SensorChoice';

  export let width: number;
  export let currentSensorChoice: SensorChoice;

  let selectedData: LiveData[] = [];

  $: {
    
    if (currentSensorChoice.accelerometerSelected()) {
      selectedData.push(liveAccelerometerData);
    } 
    if (currentSensorChoice.magnetometerSelected()) {
      selectedData.push(liveMagnetometerData);
    } 
    if (currentSensorChoice.lightSelected()) {
      selectedData.push(liveLightData);
    }
  }
</script>

<LiveGraph
  minValue={StaticConfiguration.liveGraphValueBounds.min}
  maxValue={StaticConfiguration.liveGraphValueBounds.max}
  liveData = selectedData
  {width} />
