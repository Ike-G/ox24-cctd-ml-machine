<script context="module" lang="ts">
  import SensorButton from './SensorButton.svelte';
  import { t } from '../../i18n';
  import { derived, writable, Readable } from 'svelte/store';
  import SensorChoice from '../../script/sensors/SensorChoice';

  const accel = writable(false);
  const magnet = writable(false);
  export const sensorChoice: Readable<SensorChoice> = derived(
    [accel, magnet],
    ([a, m]) => {
      return new SensorChoice(a, m);
    },
  );
</script>
<script lang="ts">
  import { classifier } from '../../script/stores/Stores';
  const model = classifier.getModel();
  const ignored = writable(false);
</script>

<main class="flex flex-col h-full justify-center">
  {#if $model.isTrained && !$ignored}
    <div
      class="absolute z-10 w-full h-full bg-opacity-50 bg-white-500 backdrop-filter backdrop-blur-sm"
      on:click={() => ($ignored = true)}>
      <div class="flex flex-col h-full justify-center">
        <p class="w-2/3 text-center text-2xl bold m-auto">
          {$t('content.sensors.alreadyTrained')}
        </p>
      </div>
    </div>
  {/if}
  <div class="inline-block min-w-full">
    <p class="text-center text-2xl bold m-auto">{$t(`menu.sensors.helpBody`)}</p>
    <div class="flex-grow">
      <SensorButton sensor="accelerometer" state={accel} />
    </div>
    <div class="flex-grow">
      <SensorButton sensor="magnetometer" state={magnet} />
    </div>
  </div>
</main>
