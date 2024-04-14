<script lang="ts">
  import { t } from '../i18n';
  import SensorChoice from '../script/sensors/SensorChoice';

  export let sensorChoice: SensorChoice;

  let sensorStrings = sensorChoice
    .choiceIds()
    .map(x => $t(`content.sensors.${x}The`).toLowerCase());
  let sensorString =
    sensorStrings.length == 1
      ? sensorStrings[0]
      : sensorStrings.slice(0, -1).join(', ') +
        ' and ' +
        sensorStrings[sensorStrings.length - 1];
</script>

<span>
  {sensorString}
</span>
