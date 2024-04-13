<script>
    import PersistantWritable from '../../script/repository/PersistantWritable';
    import SensorButton from "./SensorButton.svelte";
    import { t } from '../../i18n';

    const accel = new PersistantWritable(false, `sensor-accelerometer`);
    const magnet = new PersistantWritable(false, `sensor-magnetometer`);
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
