<!--
  (c) 2023, Center for Computational Thinking and Design at Aarhus University and contributors
 
  SPDX-License-Identifier: MIT
 -->

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Chart,
    registerables,
    ChartConfiguration,
    ChartTypeRegistry,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
  } from 'chart.js';
  import RecordingInspector from '../3d-inspector/RecordingInspector.svelte';
  import { sensorChoice } from '../../script/stores/Stores';
  import { get } from 'svelte/store';
  import { FlatCombinedDataArray } from '../../script/livedata/CombinedData';

  const sensorKeys = get(sensorChoice).choiceKeys() as (keyof FlatCombinedDataArray)[];

  export let data: FlatCombinedDataArray;

  let verticalLineX = NaN;
  let hoverIndex = NaN;
  let modalPosition = { x: 0, y: 0 };
  let modalSize = 250;
  const verticalLineCol = 'black';
  const verticalLineWidth = 1;

  // TODO: currently always just shows accelerometer, but does anything else make sense at the moment?
  const getDataByIndex = (index: number) => {
    if (isNaN(index)) {
      return { x: 0, y: 0, z: 0 };
    }
    return {
      x: data.accx[index],
      y: data.accy[index],
      z: data.accz[index],
    };
  };

  let htmlElement: HTMLDivElement;
  const inspectorMarginPx = 5;

  function recomputeModalParams() {
    const rect = htmlElement.getBoundingClientRect();
    modalSize = generateSizeOfInspector(rect);
    modalPosition = generatePositionOfInspector(rect, modalSize);
  }

  /**
   * Positions in regards to size of modal following these rules:
   * - It prefers center-aligning with element in focus (The recording). Moves into view if circle
   * escapes the left or right side.
   * - It prefers showing downwards. Changes to upwards if downwards is not possible.
   * - It always positions at an offset from the element in focus.
   */
  function generatePositionOfInspector(
    rect: DOMRect,
    size: number,
  ): { x: number; y: number } {
    const rectCenterX = (rect.left + rect.right) / 2;

    let x = rectCenterX - size / 2;
    x = Math.max(0, x);
    x = Math.min(x, window.innerWidth - size);

    const showAboveGraph = window.innerHeight - rect.bottom - 15 < size;
    const y = showAboveGraph
      ? rect.top - inspectorMarginPx - size
      : rect.bottom + inspectorMarginPx;

    return { x, y };
  }

  function generateSizeOfInspector(rect: DOMRect): number {
    return (window.innerHeight - rect.height) / 2 - inspectorMarginPx;
  }

  function getConfig(): ChartConfiguration<
    keyof ChartTypeRegistry,
    { x: number; y: number }[],
    string
  > {
    const labels = ['x', 'y', 'z', "x'", "y'", "z'", 'l'];
    const colours = {
      accx: 'red',
      accy: 'green',
      accz: 'blue',
      magx: 'orange',
      magy: 'turquoise',
      magz: 'magenta',
      light: 'purple',
    };
    const recording: { x: number; y: number }[][] = [];
    for (let i = 0; i < sensorKeys.length; i++) {
      recording[i] = [];
    }
    for (let i = 1; i < data.accx.length; i++) {
      for (let j = 0; j < sensorKeys.length; j++) {
        recording[j].push({ x: i, y: data[sensorKeys[j]][i - 1] });
      }
    }
    return {
      type: 'line',
      data: {
        datasets: Array.from(Array(sensorKeys.length).keys()).map(idx => {
          return {
            label: labels[idx],
            borderColor: colours[sensorKeys[idx]],
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 0,
            data: recording[idx],
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          x: {
            type: 'linear',
            min: 0,
            max: data.accx.length,
            grid: {
              color: '#f3f3f3',
            },
            ticks: {
              display: false, //this will remove only the label
            },
          },
          y: {
            type: 'linear',
            min: -2.5,
            max: 2.5,
            grid: {
              color: '#f3f3f3',
            },
            ticks: {
              display: false, //this will remove only the label
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
        },
      },
      plugins: [
        {
          id: 'mouseLine',
          afterEvent: (chart, args) => {
            if (!args.inChartArea || args.event.type === 'mouseout') {
              verticalLineX = NaN;
              hoverIndex = NaN;
              return;
            }
            verticalLineX = args.event.x ?? NaN;
            if (args.event.native != null) {
              // only recompute modal params if modal is closed (i.e. this event opens the modal)
              if (isNaN(hoverIndex)) {
                recomputeModalParams();
              }
              hoverIndex = chart.getElementsAtEventForMode(
                args.event.native,
                'nearest',
                {},
                true,
              )[0].index;
            } else {
              hoverIndex = NaN;
            }
          },
          afterDraw: function (chart) {
            var ctx = chart.ctx;
            var chartArea = chart.chartArea;

            if (!isNaN(verticalLineX)) {
              ctx.save();
              ctx.strokeStyle = verticalLineCol;
              ctx.lineWidth = verticalLineWidth;
              let path = new Path2D();
              path.moveTo(verticalLineX, chartArea.bottom - 10);
              path.lineTo(verticalLineX, chartArea.top);
              ctx.stroke(path);
              ctx.restore();
            }
          },
        },
      ],
    };
  }

  let canvas: HTMLCanvasElement;
  onMount(() => {
    Chart.unregister(...registerables);
    Chart.register([LinearScale, LineController, PointElement, LineElement]);
    const chart = new Chart(
      canvas.getContext('2d') ?? new HTMLCanvasElement(),
      getConfig(),
    );
    return () => {
      chart.destroy();
    };
  });
</script>

<div bind:this={htmlElement} class="h-full w-full relative">
  <!--<p>HI {$sensorChoice.choiceKeys().length}</p>-->
  <div class="z-1 h-full w-full absolute">
    {#if !isNaN(hoverIndex)}
      <p
        style="margin-left: {verticalLineX - 20}px; pointer-events:none;"
        class="absolute mt-20 w-10 text-center">
        {hoverIndex}
      </p>
    {/if}

    <canvas bind:this={canvas} />
  </div>
  <RecordingInspector
    dataPoint={getDataByIndex(hoverIndex)}
    position={modalPosition}
    isOpen={!isNaN(hoverIndex)}
    size={modalSize} />
</div>
