<script lang="ts">
import {
    computed,
    defineComponent,
    onMounted,
    ref,
    toRefs,
    watchEffect,
} from 'vue';
import * as d3 from 'd3';
import { useWeibodataStore } from "../store/weibodataStore";


export default defineComponent({
    name: 'Calendar',
    props: {
        // data: { default: undefined },
        x: {
            type: Function,
            default: d => new Date(d.date)
        },
        y: {
            type: Function,
            default: d => d.num
        },
        title: { default: undefined },
        width: { default: 928 },
        cellSize: { default: 17 },
        weekday: { default: "monday" },
        formatDay: {
            type: Function,
            default: i => "SMTWTFS"[i]
        },
        formatMonth: { default: "%b" },
        yFormat: { default: undefined },
        colors: {
            type: Function,
            default: d3.interpolatePiYG
        }
    },
    setup(props) {
        const {
            x,
            y,
            title,
            width,
            cellSize,
            weekday,
            formatDay,
            formatMonth,
            yFormat,
            colors,

        } = toRefs(props)

        const weibodataStore = useWeibodataStore()
        const data = computed(() => weibodataStore.date_num2 )

        const X = computed(() => d3.map(data.value, x.value))
        const Y = computed(() => d3.map(data.value, y.value))
        const I = computed(() => d3.range(X.value.length))
        const countDay = computed(() => weekday.value === "sunday" ? i => i : i => (i + 6) % 7)
        const timeWeek = computed(() => weekday.value === "sunday" ? d3.utcSunday : d3.utcMonday)
        const weekDays = computed(() => weekday.value === "weekday" ? 5 : 7)
        const height = computed(() => cellSize.value * (weekDays.value + 2))
        const max = computed(() => d3.quantile(Y.value, 0.9975, Math.abs))
        const color = computed(() => d3.scaleSequential([-max.value, +max.value], colors.value).unknown("none"))
        const formatMonth1 = computed(() => d3.utcFormat(formatMonth.value))
        const title1 = computed(() => {
            if (title.value === undefined) {
                const formatDate = d3.utcFormat("%B %-d, %Y");
                const formatValue = color.value.tickFormat(100, yFormat.value);
            }
            else if (title.value !== null) {
                const T = d3.map(data.value, title.value);
                return i => T[i]
            }
            if (title.value === undefined) {
                const formatDate = d3.utcFormat("%B %-d, %Y");
                const formatValue = color.value.tickFormat(100, yFormat.value);
                return i => `${formatDate(X.value[i])}\n${formatValue(Y.value[i])}`
            }
            return title.value
        })
        const years = computed(() => d3.groups(I.value, i => X.value[i].getUTCFullYear()).reverse())
        function pathMonth(t) {
            const d = Math.max(0, Math.min(weekDays.value, countDay.value(t.getUTCDay())));
            const w = timeWeek.value.count(d3.utcYear(t), t);
            return `${d === 0 ? `M${w * cellSize.value},0`
                : d === weekDays.value ? `M${(w + 1) * cellSize.value},0`
                    : `M${(w + 1) * cellSize.value},0V${d * cellSize.value}H${w * cellSize.value}`}V${weekDays.value * cellSize.value}`;
        }
        const year = ref<SVGElement>()

        onMounted(() => {
            d3.selectAll(Array.from(year.value))
                .data(years.value)
        })
        return {
            X,
            Y,
            I,
            countDay,
            timeWeek,
            weekDays,
            height,
            max,
            color,
            years,
            title1,
            formatMonth1,
            year,
            d3,
        }
    },
});
</script>
  
<template>
    <svg :width="width" :height="height * years.length" :viewBox="[0, 0, width, height * years.length]"
        :style='"max-width: 100%; height: auto; height: intrinsic;"' :font-family='"sans-serif"' :font-size="10">
        <g ref="year" v-for="(item0, index0) in years" :transform="`translate(40.5,${height * index0 + cellSize * 1.5})`">
            <text :x="-5" :y="-5" :font-weight='"bold"' :text-anchor='"end"' v-text="item0[0]" />
            <g :text-anchor='"end"'>
                <text v-for="(item1, index1) in weekday === 'weekday' ? d3.range(1, 6) : d3.range(7)" :x="-5"
                    :y="(countDay(item1) + 0.5) * cellSize" :dy='"0.31em"' v-text="formatDay(item1)" />
            </g>

            <g>
                <rect v-for="(item2, index2) in weekday === 'weekday'
                    ? item0[1].filter(i => ![0, 6].includes(X[i].getUTCDay()))
                    : item0[1]" :width="cellSize - 1" :height="cellSize - 1"
                    :x="timeWeek.count(d3.utcYear(X[item2]), X[item2]) * cellSize + 0.5"
                    :y="countDay(X[item2].getUTCDay()) * cellSize + 0.5" :fill="color(Y[item2])">
                    <title v-if="title1" v-text="title1(item2)" />
                </rect>

            </g>

            <g>
                <g
                    v-for="(item3, index3) in d3.utcMonths(d3.utcMonth(X[item0[1][0]]), X[item0[1][item0[1].length - 1]])">
                    <path :fill='"none"' :stroke='"#fff"' :stroke-width="3" :d="pathMonth" />
                    <text :x="timeWeek.count(d3.utcYear(item3), timeWeek.ceil(item3)) * cellSize + 2" :y="-5"
                        v-text="formatMonth1(item3)" />
                </g>

            </g>

        </g>

    </svg>
</template>