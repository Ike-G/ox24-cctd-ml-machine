<!--
  (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->

<script lang="ts">
  import { state } from '../../script/stores/uiStore';
  import { onMount } from 'svelte';
  import { type Unsubscriber } from 'svelte/store';
  import { SmoothieChart, TimeSeries } from 'smoothie';
  import DimensionLabels from './DimensionLabels.svelte';
  import LiveData from '../../script/domain/stores/LiveData';
  import StaticConfiguration from '../../StaticConfiguration';
  import SmoothedLiveData from '../../script/livedata/SmoothedLiveData';
  import { classifier } from '../../script/stores/Stores';
  import LiveGraphRow from './LiveGraphRow.svelte';

  // Updates width to ensure that the canvas fills the whole screen
  export let width: number;
  export let liveData: LiveData<any>[];

  export let maxValue: number;
  export let minValue: number;
</script>

<main class="flex flex-col divide-y-2">
  {#each liveData as data}
    <LiveGraphRow width={width} liveData={data} maxValue={maxValue} minValue={minValue} />
  {/each}
</main>
