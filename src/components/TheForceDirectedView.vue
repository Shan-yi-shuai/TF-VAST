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
  name: 'ForceGraph',
  props: {
    // nodes: { default: undefined },
    // links: { default: undefined },
    nodeId: {
      type: Function,
      default: d => d.text
    },
    nodeGroup: { default: undefined },
    nodeGroups: { default: undefined },
    nodeTitle: {
      type: Function,
      default: d => d.text
    },
    nodeFill: { default: "currentColor" },
    nodeStroke: { default: "#fff" },
    nodeStrokeWidth: { default: 1.5 },
    nodeStrokeOpacity: { default: 1 },
    nodeRadius: { default: 5 },
    nodeStrength: { default: undefined },
    linkSource: {
      type: Function,
      default: ({ source }) => source
    },
    linkTarget: {
      type: Function,
      default: ({ target }) => target
    },
    linkStroke: { default: "#999" },
    linkStrokeOpacity: { default: 0.6 },
    linkStrokeWidth: { default: 1.5 },
    linkStrokeLinecap: { default: "round" },
    linkStrength: { default: undefined },
    colors: {
      type: Function,
      default: d3.schemeTableau10
    },
    width: { default: 600 },
    height: { default: 600 },
    invalidation: { default: undefined }
  },
  setup(props) {
    const {
      nodeId,
      nodeGroup,
      nodeGroups,
      nodeTitle,
      nodeFill,
      nodeStroke,
      nodeStrokeWidth,
      nodeStrokeOpacity,
      nodeRadius,
      nodeStrength,
      linkSource,
      linkTarget,
      linkStroke,
      linkStrokeOpacity,
      linkStrokeWidth,
      linkStrokeLinecap,
      linkStrength,
      colors,
      width,
      height,
      invalidation,

    } = toRefs(props)

    const weibodataStore = useWeibodataStore()
    const nodes = computed(() => weibodataStore.graph.nodes)
    const links = computed(() => weibodataStore.graph.links)

    const N = computed(() => d3.map(nodes.value, nodeId.value).map(intern))
    const LS = computed(() => d3.map(links.value, linkSource.value).map(intern))
    const LT = computed(() => d3.map(links.value, linkTarget.value).map(intern))
    const nodeTitle1 = computed(() => {
      if (nodeTitle.value === undefined) {
        return (_, i) => N.value[i]
      }
      return nodeTitle.value
    })

    const T = computed(() => nodeTitle.value == null ? null : d3.map(nodes.value, nodeTitle1.value))
    const G = computed(() => nodeGroup.value == null ? null : d3.map(nodes.value, nodeGroup.value).map(intern))
    const W = computed(() => typeof linkStrokeWidth.value !== "function" ? null : d3.map(links.value, linkStrokeWidth.value))
    const L = computed(() => typeof linkStroke.value !== "function" ? null : d3.map(links.value, linkStroke.value))
    const nodes1 = computed(() => d3.map(nodes.value, (_, i) => ({ id: N.value[i] })))
    const links1 = computed(() => d3.map(links.value, (_, i) => ({ source: LS.value[i], target: LT.value[i] })))
    const nodeGroups1 = computed(() => {
      if (G.value && nodeGroups.value === undefined) {
        return d3.sort(G.value)
      }
      return nodeGroups.value
    })
    const color = computed(() => nodeGroup.value == null ? null : d3.scaleOrdinal(nodeGroups1.value, colors.value))
    const forceNode = computed(() => d3.forceManyBody())
    const forceLink = computed(() => d3.forceLink(links1.value).id(({ index: i }) => N.value[i]))
    if (nodeStrength.value !== undefined) {
      forceNode.value.strength(nodeStrength.value);
    }
    if (linkStrength.value !== undefined) {
      forceLink.value.strength(linkStrength.value);
    }
    const simulation = computed(() => d3.forceSimulation(nodes1.value)
      .force("link", forceLink.value)
      .force("charge", forceNode.value)
      .force("boundary", d3.forceRadial(150, 0, 0))
      .force("center", d3.forceCenter(0, 0))     
      .on("tick", ticked))
    
    const link = ref<SVGElement>()
    onMounted(() => {
      d3.selectAll(Array.from(link.value))
        .data(links1.value)
    })
    const node = ref<SVGElement>()
    watchEffect(() => {
      if (node.value === null) return;
      d3.selectAll(node.value)
        .call(drag(simulation.value))

    })


    onMounted(() => {
      d3.selectAll(Array.from(node.value))
        .data(nodes1.value)
    })
    if (invalidation.value != null) {
      invalidation.value.then(() => simulation.value.stop());
    }
    function intern(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }
    function ticked() {
      d3.selectAll(Array.from(link.value))
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y); 
      d3.selectAll(Array.from(node.value))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    return {
      N,
      LS,
      LT,
      T,
      G,
      W,
      L,
      color,
      forceNode,
      forceLink,
      simulation,
      nodes1,
      links1,
      nodeGroups1,
      nodeTitle1,
      link,
      node,
    }
  },
});
</script>

<template>
  <svg :width="width" :height="height" :viewBox="[-width / 2, -height / 2, width, height]"
    :style='"max-width: 100%; height: auto; height: intrinsic;"'>
    <g :stroke='typeof linkStroke !== "function" ? linkStroke : null' :stroke-opacity="linkStrokeOpacity"
      :stroke-width='typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null' :stroke-linecap="linkStrokeLinecap">
      <line ref="link" v-for="(item, index) in  links1" :stroke-width="W ? W[index] : null"
        :stroke="L ? L[index] : null" />
    </g>

    <g :fill="nodeFill" :stroke="nodeStroke" :stroke-opacity="nodeStrokeOpacity" :stroke-width="nodeStrokeWidth">
      <circle ref="node" v-for="(item, index) in  nodes1" :r="nodeRadius" :fill="G ? color(G[index]) : null">
        <title v-if="T" v-text="T[index]" />
      </circle>

    </g>

  </svg>
</template>