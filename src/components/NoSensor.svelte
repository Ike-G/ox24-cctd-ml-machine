<script>
  import { t } from '../i18n';
  import { sensorChoice } from '../script/stores/Stores';
</script>

{#if !$sensorChoice.validChoice()}
  <div
    class="absolute z-10 w-full h-full bg-opacity-50 bg-white-500 backdrop-filter backdrop-blur-sm">
    <div class="flex flex-col h-full justify-center">
      <p class="w-2/3 text-center text-2xl bold m-auto">{$t('content.data.noSensors')}</p>
    </div>
  </div>
{/if}
