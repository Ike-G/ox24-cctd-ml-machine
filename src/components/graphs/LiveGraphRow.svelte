<!--
  (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->

<script lang="ts">
    import { state } from '../../script/stores/uiStore';
    import { onMount } from 'svelte';
    import { type Unsubscriber } from 'svelte/store';
    import { ITimeSeriesPresentationOptions, SmoothieChart, TimeSeries } from 'smoothie';
    import DimensionLabels from './DimensionLabels.svelte';
    import LiveData from '../../script/domain/stores/LiveData';
    import StaticConfiguration from '../../StaticConfiguration';
    import SmoothedLiveData from '../../script/livedata/SmoothedLiveData';
    import { classifier } from '../../script/stores/Stores';
  
    /**
     * TimesSeries, but with the data array added.
     * `data[i][0]` is the timestamp,
     * `data[i][1]` is the value,
     */
    type TimeSeriesWithData = TimeSeries & { data: number[][] };
  
    // Updates width to ensure that the canvas fills the whole screen
    export let width: number;
    export let liveData: LiveData<any>;
  
    export let maxValue: number;
    export let minValue: number;

    export let enabled: boolean;
  
    // Smoothes real-time data by using the 3 most recent data points
    const smoothedLiveData = new SmoothedLiveData(liveData, 3);
  
    var canvas: HTMLCanvasElement | undefined = undefined;
    var chart: SmoothieChart | undefined;
    const lines: TimeSeriesWithData[] = [];
  
    for (let i = 0; i < smoothedLiveData.getSeriesSize(); i++) {
      lines.push(new TimeSeries() as TimeSeriesWithData);
    }
    let recordLines = new TimeSeries();
    const lineWidth = 2;

    function lerp(a: number, b: number, f: number): number {
      return a + (b - a)*f;
    }

    function lerpCols(a: number, b: number, f: number): number {
      return  Math.floor(lerp(a & 0xff, b & 0xff, f)) |
              (Math.floor(lerp(a & 0xff00, b & 0xff00, f)) & 0xff00) |
              (Math.floor(lerp(a & 0xff0000, b & 0xff0000, f)) & 0xff0000)
    }

    function mixGray(c: string) {
      if (enabled) return c;
      return "#" + lerpCols(
        parseInt(c.slice(1), 16),
        0x919191,
        0.7
      ).toString(16).padStart(6, "0");
    }

    let colors: string[];
    const timeSeries: ITimeSeriesPresentationOptions[] = [];
    $: {
      colors = lines.map((_, i) => mixGray(StaticConfiguration.liveGraphColors[liveData.getPropertyNames()[i]]));
      timeSeries.forEach((t, i) => {
        t.strokeStyle = colors[i];
      });
    }
  
    // On mount draw smoothieChart
    onMount(() => {
      chart = new SmoothieChart({
        maxValue,
        minValue,
        millisPerPixel: 7,
        grid: {
          fillStyle: '#ffffff00',
          strokeStyle: 'rgba(48,48,48,0.20)',
          millisPerLine: 3000,
          borderVisible: false,
        },
        labels: {
          disabled: true
        },
        interpolation: 'linear',
      });
      
      for (let i = 0; i < lines.length; i++) {
        chart.addTimeSeries(lines[i], {
          lineWidth,
          strokeStyle: colors[i],
        });
        timeSeries.push(chart.getTimeSeriesOptions(lines[i]));
      }
  
      chart.addTimeSeries(recordLines, {
        lineWidth: 3,
        strokeStyle: '#4040ff44',
        fillStyle: '#0000ff07',
      });
      chart.streamTo(<HTMLCanvasElement>canvas, 0);
      chart.stop();
    });
  
    // Start and stop chart when microbit connect/disconnect
    const model = classifier.getModel();
    $: {
      if (chart !== undefined) {
        if ($state.isInputReady) {
          if (!$model.isTraining) {
            chart.start();
          } else {
            chart.stop();
          }
        } else {
          chart.stop();
        }
      }
    }
  
    // Draw on graph to display that users are recording
    // The jagged edges problem is caused by repeating the recordingStarted function.
    // We will simply block the recording from starting, while it's recording
    let blockRecordingStart = false;
    $: recordingStarted($state.isRecording);
  
    // Function to clearly diplay the area in which users are recording
    function recordingStarted(isRecording: boolean): void {
      if (!isRecording || blockRecordingStart) {
        return;
      }
  
      // Set start line
      recordLines.append(new Date().getTime() - 1, minValue, false);
      recordLines.append(new Date().getTime(), maxValue, false);
  
      // Wait a second and set end line
      blockRecordingStart = true;
      setTimeout(() => {
        recordLines.append(new Date().getTime() - 1, maxValue, false);
        recordLines.append(new Date().getTime(), minValue, false);
        blockRecordingStart = false;
      }, StaticConfiguration.recordingDuration);
    }
  
    // When state changes, update the state of the canvas
    $: {
      const isConnected = $state.isInputReady;
      updateCanvas(isConnected);
    }
  
    let unsubscribeFromData: Unsubscriber | undefined;
  
    // If state is connected. Start updating the graph whenever there is new data
    // From the Micro:Bit
    function updateCanvas(isConnected: boolean) {
      if (isConnected) {
        unsubscribeFromData = smoothedLiveData.subscribe(data => {
          addDataToGraphLines(data);
        });
  
        // Else if we're currently subscribed to data. Unsubscribe.
        // This means that the micro:bit has been disconnected
      } else if (unsubscribeFromData !== undefined) {
        unsubscribeFromData();
        unsubscribeFromData = undefined;
      }
    }
  
    const addDataToGraphLines = (data: any) => {
      const t = new Date().getTime();
      let i = 0;
      for (const property in data) {
        const line: TimeSeriesWithData = lines[i];
        if (!line) {
          break;
        }
        const newValue = data[property];
        line.append(t, newValue, false);
        i++;
      }
    };
</script>

<main class="relative">
  <div class="flex">
    <canvas bind:this={canvas} height={160/3} id="smoothie-chart" width={width - 30} />
    {#if !enabled}
    <div class="absolute top-0 left-0 w-full h-full" style="background-color: rgb(200, 200, 200, 0.5);"></div>
    {/if}
    <DimensionLabels
        hidden={!$state.isInputConnected}
        {minValue}
        graphHeight={160/3}
        {maxValue}
        liveData={smoothedLiveData} {colors} />
  </div>
</main>  
