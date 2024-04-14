<script>
  import Information from '../../components/information/Information.svelte';
  import { t } from '../../i18n';

  export let sensor;
  export let state;
</script>

<div
  class="border-1 border-primaryborder border-solid rounded-xl bg-backgroundlight mx-4 my-5 max-w transition ease duration-150 cursor-pointer"
  class:text-white={$state}
  class:bg-gray-600={$state}>
  <label
    for="sensor-{sensor}"
    class="py-5 pl-5 cursor-pointer select-none block flex flex-row">
    <div class="inline-block">
      {#if $state}
        <Information
          isLightTheme={true}
          iconText={$t(`content.sensors.${sensor}Title`)}
          titleText={$t(`content.sensors.${sensor}Title`)}
          bodyText={$t(`content.sensors.${sensor}`)} />
      {:else}
        <Information
          isLightTheme={false}
          iconText={$t(`content.sensors.${sensor}Title`)}
          titleText={$t(`content.sensors.${sensor}Title`)}
          bodyText={$t(`content.sensors.${sensor}`)} />
      {/if}
    </div>
    <div class="flex-grow"></div>
    <div class="inline-block pr-5">
      <input type="checkbox" id="sensor-{sensor}" bind:checked={$state} />
    </div>
  </label>
</div>
