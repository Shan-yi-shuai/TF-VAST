<template>
    <div class="container">
        <svg ref="svgRef" :width="width" :height="height"></svg>
    </div>
</template>
  
<script>
import { ref, onMounted, computed, watch, watchEffect } from 'vue';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { useWeibodataStore } from "../store/weibodataStore";

export default {
    name: 'WordCloud',
    setup() {
        const svgRef = ref(null);
        const width = 290;
        const height = 300;
        // const wordList = [
        //     { text: 'Hello', size: 40 },
        //     { text: 'World', size: 30 },
        //     { text: 'Vue', size: 20 },
        //     { text: 'd3', size: 10 },
        // ];

        const weibodataStore = useWeibodataStore()
        const wordList = computed(() => weibodataStore.word_list)

        // onMounted(() => {
        //     const svg = d3.select(svgRef.value);

        //     const layout = cloud()
        //         .size([width, height])
        //         .words(wordList.value)
        //         .padding(5)
        //         .rotate(() => (~~(Math.random() * 6) - 3) * 30)
        //         .font('Impact')
        //         .fontSize(d => d.size)
        //         .on('end', draw);

        //     layout.start();

        //     function draw(words) {
        //         svg
        //             .append('g')
        //             .attr('transform', `translate(${width / 2}, ${height / 2})`)
        //             .selectAll('text')
        //             .data(words)
        //             .join('text')
        //             .style('font-size', d => `${d.size}px`)
        //             .style('font-family', 'Impact')
        //             .style('fill', 'steelblue')
        //             .attr('text-anchor', 'middle')
        //             .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
        //             .text(d => d.text);
        //     }
        // });
        onMounted(() => {
            const svg = d3.select(svgRef.value);

            function draw(words) {
                svg
                    .selectAll('text')
                    .remove()
                    .exit()
                svg
                    .append('g')
                    .attr('transform', `translate(${width / 2}, ${height / 2})`)
                    .selectAll('text')
                    .remove()
                    .exit()
                    .data(words)
                    .join('text')
                    .style('font-size', d => `${d.size}px`)
                    .style('font-family', 'Impact')
                    .style('fill', 'steelblue')
                    .attr('text-anchor', 'middle')
                    .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
                    .text(d => d.text);
            }

            const layout = cloud()
                .size([width, height])
                .padding(5)
                .rotate(() => (~~(Math.random() * 6) - 3) * 30)
                .font('Impact')
                .fontSize(d => d.size);

            watchEffect(() => {
                layout.words(wordList.value).on('end', (words) => {
                    draw(words);
                });
                layout.start();
            });
        });


        return { svgRef, width, height };
    },
};
</script>
  
<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

svg {
    background-color: #ffffff;
    /* border: 1px solid #aaa; */
}
</style>
  