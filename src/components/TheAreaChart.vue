<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  toRefs,
  watchEffect,
} from 'vue';
import type { PropType } from 'vue';
import * as d3 from 'd3';
import type { CurveFactory } from 'd3';
import { useWeibodataStore } from "../store/weibodataStore";

export default defineComponent({
  name: 'AreaChart',
  props: {
    // data: {
    //   type: Array,
    //   default: undefined,
    // },
    // given d in data, returns the (temporal) x-value
    x: {
      type: Function as PropType<(d: unknown) => number>,
      default: d => new Date(d.date),
    },
    // given d in data, returns the (quantitative) y-value
    y: {
      type: Function as PropType<(d: unknown) => number>,
      default: d => d.num
    },
    // given d in data, returns true if defined (for gaps)
    defined: {
      type: Function,
      default: undefined,
    },
    // method of interpolation between points
    curve: {
      type: Function as PropType<CurveFactory>,
      default: d3.curveLinear,
    },
    // top margin, in pixels
    marginTop: {
      type: Number as PropType<number>,
      default: 20,
    },
    // right margin, in pixels
    marginRight: {
      type: Number as PropType<number>,
      default: 30,
    },
    // bottom margin, in pixels
    marginBottom: {
      type: Number as PropType<number>,
      default: 30,
    },
    // left margin, in pixels
    marginLeft: {
      type: Number as PropType<number>,
      default: 40,
    },
    // outer width, in pixels
    width: {
      type: Number as PropType<number>,
      default: 840,
    },
    // outer height, in pixels
    height: {
      type: Number as PropType<number>,
      default: 300,
    },
    // type of x-scale
    xType: {
      type: Function,
      default: d3.scaleUtc,
    },
    // [xmin, xmax]
    xDomain: {
      type: Object as PropType<[Number, Number]>,
      default: undefined,
    },
    // [left, right]
    xRange: {
      type: Object as PropType<[Number, Number]>,
      default: undefined,
    },
    // type of y-scale
    yType: {
      type: Function,
      default: d3.scaleLinear,
    },
    // [ymin, ymax]
    yDomain: {
      type: Object as PropType<[Number, Number]>,
      default: undefined,
    },
    // [bottom, top]
    yRange: {
      type: Object as PropType<[Number, Number]>,
      default: undefined,
    },
    // a format specifier string for the y-axis
    yFormat: {
      type: String as PropType<String>,
      default: undefined,
    },
    // a label for the y-axis
    yLabel: {
      type: String as PropType<String>,
      default: undefined,
    },
    // fill color of area
    color: {
      type: String as PropType<String>,
      default: 'steelblue',
    },
  },
  setup(props) {
    const {
      x,
      y,
      defined,
      curve,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      width,
      height,
      xType,
      xDomain,
      xRange,
      yType,
      yDomain,
      yRange,
      yFormat,
      yLabel,
      color,
    } = toRefs(props)

    const weibodataStore = useWeibodataStore()
    const data = computed(() => weibodataStore.date_num )

    const _yRange = computed(() => {
      return [height.value - marginBottom.value, marginTop.value]
    })

    console.log(_yRange.value)
    const _xRange = computed(() => {
      return [marginLeft.value, width.value - marginRight.value]
    })
    
    const X = computed(() => d3.map(data.value, x.value))
    const Y = computed(() => d3.map(data.value, y.value))
    const I = computed(() => d3.range(X.value.length))
    const _defined = computed(() => {
      if (defined.value === undefined) {
        return (d, i) => !isNaN(X.value[i]) && !isNaN(Y.value[i])
      }
      else {
        return defined.value
      }
    })
    const D = computed(() => d3.map(data.value, _defined.value))
    const _xDomain = computed(() => {
      if (xDomain.value === undefined) {
        return d3.extent(X.value)
      }
      else {
        return xDomain.value
      }
    })
    const _yDomain = computed(() => {
      if (yDomain.value === undefined) {
        return [0, d3.max(Y.value)]
      }
      else {
        return yDomain.value
      }
    })
    console.log(_xDomain.value)
    console.log(_yDomain.value)
    const xScale = computed(() => xType.value(_xDomain.value, _xRange.value))
    console.log(X.value[1])
    console.log(xScale.value(X.value[X.value.length - 1]))
    const yScale = computed(() => yType.value(_yDomain.value, _yRange.value))
    const xAxis = computed(() => d3.axisBottom(xScale.value).ticks(width.value / 80).tickSizeOuter(0))
    const yAxis = computed(() => d3.axisLeft(yScale.value).ticks(height.value / 40, yFormat.value))

    const area = computed(() => d3.area()
      .defined(i => D.value[i])
      .curve(curve.value)
      .x(i => xScale.value(X.value[i]))
      .y0(yScale.value(0))
      .y1(i => yScale.value(Y.value[i]))
      )
    const g0 = ref<SVGElement>()
    watchEffect(() => {
      if (g0.value === null) return;
      d3.select(g0.value)
        .call(yAxis.value)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width.value - marginLeft.value - marginRight.value)
          .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
          .attr("x", - marginLeft.value)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel.value))

    })
    const g1 = ref<SVGElement>()
    watchEffect(() => {
      if (g1.value === null) return;
      d3.select(g1.value)
        .call(xAxis.value)

    })

    // 刷选
    const brushing = ref(false);
    const brushX = ref(0);
    const brushWidth = ref(0);
    
    function onBrushStart(event) {
      brushing.value = true;
      brushX.value = event.offsetX;
      brushWidth.value = 0;
    }
    
    function onBrushMove(event) {
      if (brushing.value) {
        const x = event.offsetX;
        brushWidth.value = Math.abs(x - brushX.value);
      }
    }
    
    function onBrushEnd() {
      brushing.value = false;
      // 计算刷选区域在x轴的范围
      const x1 = brushX.value;
      const x2 = brushX.value + brushWidth.value;
      weibodataStore.start = xScale.value.invert(x1);
      weibodataStore.end = xScale.value.invert(x2);

      // console.log(`Brush range on x-axis: ${xScale.value.invert(x1)} - ${xScale.value.invert(x2)}`);
    }


    return {
      _xRange,
      _yRange,
      X,
      Y,
      I,
      D,
      xScale,
      yScale,
      xAxis,
      yAxis,
      area,
      _defined,
      _xDomain,
      _yDomain,
      g0,
      g1,
      onBrushStart,
      onBrushMove,
      onBrushEnd,
      brushing,
      brushX,
      brushWidth,
    }
  },
});
</script>

<style scoped>
.x-axis text {
  -webkit-user-select: none; /* Safari 3.1+ */
  -moz-user-select: none; /* Firefox 2+ */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Standard syntax */
}

</style>

<template>
  <svg :width="width" :height="height" :viewBox="[0, 0, width, height]"
    :style='"max-width: 100%; height: auto; height: intrinsic;"'
    @mousedown="onBrushStart"
    @mousemove="onBrushMove"
    @mouseup="onBrushEnd"
  >
    <g ref="g0" :transform="`translate(${marginLeft},0)`" />
    <path :fill="color" :d="area(I)" />
    <g ref="g1" class="x-axis" :transform="`translate(0,${height - marginBottom})`" />
    <rect v-if="brushing" :x="brushX" :y="0" :width="brushWidth" :height="height - 20" fill="rgba(0,0,0,0.1)" />
  </svg>
</template>

