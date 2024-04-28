<!-- (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->

<script lang="ts">
  import StaticConfiguration from '../../StaticConfiguration';
  import {
    liveAccelerometerData, accel,
    liveMagnetometerData, magnet,
    liveLightData, light
  } from '../../script/stores/Stores';
  import LiveGraph from './LiveGraph.svelte';
  import LiveData from '../../script/domain/stores/LiveData';

  export let width: number;
</script>

<LiveGraph
  minValue={StaticConfiguration.liveGraphValueBounds.min}
  maxValue={StaticConfiguration.liveGraphValueBounds.max}
  liveData={[
    {data: liveAccelerometerData, enabled: $accel},
    {data: liveMagnetometerData, enabled: $magnet},
    {data: liveLightData, enabled: $light}
  ]}
  {width} />
