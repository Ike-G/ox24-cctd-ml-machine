<!--
  (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->

<script lang="ts">
  import { slide } from 'svelte/transition';
  import { t } from '../i18n';
  import { gestures, sensorChoice } from '../script/stores/Stores';
  import { get } from 'svelte/store';

  // Count of amount of recordings
  $: numberOfRecordings = $gestures.reduce(
    (sum, val) => (sum += val.recordings.length),
    0,
  );
</script>

<div class="w-full text-center justify-center pt-5 pb-7">
  {#if !get(sensorChoice).validChoice()}
     <p class="text-xl">{$t('menu.data.noSensors')}</p> 
  {:else}
    <p class="text-7xl mb-4">{numberOfRecordings}</p>
    <p class="text-xl">{$t('menu.data.examples')}</p>
  {/if} 
</div>
