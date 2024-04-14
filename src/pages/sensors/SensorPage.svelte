<script lang="ts">
  import SensorButton from './SensorButton.svelte';
  import { t } from '../../i18n';
  import { accel, magnet } from '../../script/stores/Stores';
</script>

<main class="flex flex-col h-full justify-center">
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
