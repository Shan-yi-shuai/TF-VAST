<template>
    <div id="listview" style="height: 100%; width: 100%"></div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { mapState, mapActions } from "pinia";
  import { useWeibodataStore } from "../store/weibodataStore";
  import "https://code.jquery.com/jquery-3.1.1.js";
  
  export default {
    computed: {
      ...mapState(useWeibodataStore, {
        resource_data: "data",
        name_list: "name_list",
        original_text_list: "original_text_list",
        text_list: "text_list",
        keywords_list: "keywords_list",
        t_list: "t_list",
        selected: "selected",
        selected_key: "selected_key",
        weibo_graph: "weibo_graph",
        key: "key",
      }),
    },
    data() {
      return { svg: null, lines: [], sort_points: {} };
    },
    watch: {
      "selected.length": function () {
        this.find_related_point();
        // this.sort();
        this.renderListview();
      },
    },
    created: function () {
      this.create_weibo_graph();
    },
    mounted: function () {
      this.initListview();
      this.renderListview();
    },
    methods: {
      ...mapActions(useWeibodataStore, ["addKey", "deleteKey", "findKey"]),
  
      create_weibo_graph() {
        let object_key = this.key;
        let list = [];
        list = list
          .concat(this.name_list)
          .concat(this.t_list)
          .concat(this.keywords_list)
          .concat(this.original_text_list)
          .concat(this.text_list);
        //初始化
        this.sort_points["original_text"] = this.original_text_list;
        this.sort_points["text"] = this.text_list;
        this.sort_points["name"] = this.name_list;
        this.sort_points["keywords"] = this.keywords_list;
        this.sort_points["t"] = this.t_list;
  
        list.forEach((point) => {
          this.weibo_graph[point] = [];
        });
  
        this.resource_data.forEach((weibo) => {
          for (let i = 0; i < object_key.length - 1; i++) {
            if (typeof weibo[object_key[i]] == "object") {
              weibo[object_key[i]].forEach((j) => {
                if (typeof weibo[object_key[i + 1]] == "object") {
                  weibo[object_key[i + 1]].forEach((k) => {
                    this.weibo_graph[j].push(k);
                    this.weibo_graph[k].push(j);
                  });
                } else {
                  this.weibo_graph[j].push(weibo[object_key[i + 1]]);
                  this.weibo_graph[weibo[object_key[i + 1]]].push(j);
                }
              });
            } else {
              if (typeof weibo[object_key[i + 1]] == "object") {
                weibo[object_key[i + 1]].forEach((k) => {
                  this.weibo_graph[weibo[object_key[i]]].push(k);
                  this.weibo_graph[k].push(weibo[object_key[i]]);
                });
              } else {
                this.weibo_graph[weibo[object_key[i]]].push(
                  weibo[object_key[i + 1]]
                );
                this.weibo_graph[weibo[object_key[i + 1]]].push(
                  weibo[object_key[i]]
                );
              }
            }
          }
        });
  
        //去重
        for (let i in this.weibo_graph) {
          this.weibo_graph[i] = Array.from(new Set(this.weibo_graph[i]));
        }
      },
      findKey(point) {
        if (this.name_list.includes(point)) return "name";
        if (this.keywords_list.includes(point)) return "keywords";
        if (this.original_text_list.includes(point)) return "original_text";
        if (this.text_list.includes(point)) return "text";
        if (this.t_list.includes(point)) return "t";
        return "";
      },
      relatePoint(info) {
        let object_key = this.key;
        for (let i = 0; i < object_key.length - 1; i++) {
          if (typeof info[object_key[i]] == "object") {
            info[object_key[i]].forEach((point) => {
              if (typeof info[object_key[i + 1]] == "object") {
                info[object_key[i + 1]].forEach((k) => {
                  this.lines.push([point, k, object_key[i], object_key[i + 1]]);
                });
              } else {
                this.lines.push([
                  point,
                  info[object_key[i + 1]],
                  object_key[i],
                  object_key[i + 1],
                ]);
              }
            });
          } else {
            if (typeof info[object_key[i + 1]] == "object") {
              info[object_key[i + 1]].forEach((k) => {
                this.lines.push([
                  info[object_key[i]],
                  k,
                  object_key[i],
                  object_key[i + 1],
                ]);
              });
            } else {
              this.lines.push([
                info[object_key[i]],
                info[object_key[i + 1]],
                object_key[i],
                object_key[i + 1],
              ]);
            }
          }
        }
      },
      find_related_point() {
        let index = 0;
        this.lines = [];
        this.selected.forEach((point) => {
          let key = this.selected_key[index++];
          this.resource_data.forEach((weibo) => {
            if (typeof weibo[key] == "object") {
              if (weibo[key].includes(point)) this.relatePoint(weibo);
            } else {
              if (weibo[key] == point) this.relatePoint(weibo);
            }
          });
        });
        
      },
      sort() {
        let object_key = this.key;
        //初始化
        object_key.forEach((key) => {
          this.sort_points[key] = [];
        });
        this.lines.forEach((line) => {
          let key0 = this.findKey(line[0]);
          let key1 = this.findKey(line[1]);
          if (!this.sort_points[key0].includes(line[0]))
            this.sort_points[key0].push(line[0]);
          if (!this.sort_points[key1].includes(line[1]))
            this.sort_points[key1].push(line[1]);
        });
        this.original_text_list.forEach((p) => {
          if (!this.sort_points["original_text"].includes(p))
            this.sort_points["original_text"].push(p);
        });
        this.text_list.forEach((p) => {
          if (!this.sort_points["text"].includes(p))
            this.sort_points["text"].push(p);
        });
  
        this.keywords_list.forEach((p) => {
          if (!this.sort_points["keywords"].includes(p))
            this.sort_points["keywords"].push(p);
        });
  
        this.name_list.forEach((p) => {
          if (!this.sort_points["name"].includes(p))
            this.sort_points["name"].push(p);
        });
  
        this.t_list.forEach((p) => {
          if (!this.sort_points["t"].includes(p)) this.sort_points["t"].push(p);
        });
      },
      initListview() {
        // Initialize svg
        //let width = this.$el.nextElementSibling.clientWidth;
        //   let height = this.$el.nextElementSibling.clientHeight;
        let width = 1000;
        let height = 500;
        this.svg = d3
          .select("#listview")
          .append("svg")
          .attr("viewBox", [0, 0, width, height]);
      },
      renderListview() {
        // let marge = { top: 60, bottom: 60, left: 60, right: 60 };
        let marge = { top: 10, bottom: 10, left: 10, right: 10 };
        // Remove all groups in svg
        this.svg.selectAll("g").remove();
  
        let _this = this;
  
        // Configuration
        //   let width = this.$el.clientWidth;
        //   let height = this.$el.clientHeight;
        // let width = this.$el.nextElementSibling.clientWidth;
        // let height = this.$el.nextElementSibling.clientHeight;
        let width = 1000;
        let height = 500;
  
        const rect_width = width / 20;
        const rect_height = height - marge.top - marge.bottom;
        const x_name = 0;
        const x_original_text = width / 5;
        const x_text = (width / 5) * 2;
        const x_keywords = (width / 5) * 3;
        const x_t = (width / 5) * 4;
        //const interval = 200;
        let g = this.svg
          .append("g")
          .attr("transform", "translate(" + marge.top + "," + marge.left + ")");
  
        const yScale_original_text = d3
          .scaleBand()
          .domain(this.sort_points["original_text"])
          .range([20, rect_height]);
        const yScale_text = d3
          .scaleBand()
          .domain(this.sort_points["text"])
          .range([20, rect_height]);
        const yScale_keywords = d3
          .scaleBand()
          .domain(this.sort_points["keywords"])
          .range([20, rect_height]);
        const yScale_t = d3
          .scaleBand()
          .domain(this.sort_points["t"])
          .range([20, rect_height]);
        const yScale_name = d3
          .scaleBand()
          .domain(this.sort_points["name"])
          .range([20, rect_height]);
  
        g.append("text")
          .text("name")
          .attr("font-size", "1em")
          .attr("x", x_name)
          .attr("y", 15);
        
        g.append("text")
          .text("original_text")
          .attr("font-size", "1em")
          .attr("x", x_original_text)
          .attr("y", 15);
        
        g.append("text")
          .text("text")
          .attr("font-size", "1em")
          .attr("x", x_text)
          .attr("y", 15);
        
        g.append("text")
          .text("keywords")
          .attr("font-size", "1em")
          .attr("x", x_keywords)
          .attr("y", 15);
        
        g.append("text")
          .text("t")
          .attr("font-size", "1em")
          .attr("x", x_t)
          .attr("y", 15);
  
        var div = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
  
        function drawRect(
          data,
          g,
          yScale,
          color,
          x,
          click_array,
          click_key_array,
          rectname,
          key
        ) {
          g.selectAll(rectname)
            .data(data)
            .enter()
            .append("rect")
            .attr("width", rect_width)
            .attr("height", yScale.bandwidth())
            .attr("fill", function (d, i) {
              let index = click_array.indexOf(data[i]); //说明类型
              if (index != -1) {
                return "black";
              } else {
                return color;
              }
            })
            .attr("stroke", function (d, i) {
              return "black";
            })
            .attr("stroke-width", function (d, i) {
              return 0.01;
            })
            .attr("y", function (d) {
              return yScale(d);
            })
            .attr("x", function () {
              return x;
            })
            .on("click", function (d, i) {
              $("div.tooltip").remove();
              let index = click_array.indexOf(i);
              if (index != -1) {
                d3.select(this)
                  .attr("stroke", "black")
                  .attr("stroke-width", 0.01);
                d3.select(this).attr("color", "color");
                click_array.splice(index, 1);
                click_key_array.splice(index, 1);
                let dom = "div#" + (key + i).slice(0, 18);
                $(dom).remove();
              } else {
                d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
                d3.select(this).attr("color", "black");
                click_array.push(i);
                click_key_array.push(key);
  
                d3.select("body")
                  .append("div")
                  .attr("id", (key + i).slice(0, 18))
                  .attr("class", "tooltip2")
                  .style("opacity", 0.9)
                  .html(i)
                  .style("left", d.pageX + "px")
                  .style("top", d.pageY - 28 + "px");
              }
            })
            .on("mouseover", function (event, d) {
              d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
              d3.select(this).attr("color", "black");
              div.transition().duration(200).style("opacity", 0.9);
              div
                .html(d)
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function () {
              d3.select(this).attr("stroke", "black").attr("stroke-width", 0.01);
              d3.select(this).attr("color", color);
              div.transition().duration(200).style("opacity", 0);
            });
        }
        drawRect(
          this.sort_points["name"],
          g,
          yScale_name,
          "#00BFFF",
          x_name,
          this.selected,
          this.selected_key,
          "rect_name",
          "name"
        );
        drawRect(
          this.sort_points["original_text"],
          g,
          yScale_original_text,
          "#4169E1",
          x_original_text,
          this.selected,
          this.selected_key,
          "rect_original_text",
          "original_text"
        );
        drawRect(
          this.sort_points["text"],
          g,
          yScale_text,
          "#00CED1",
          x_text,
          this.selected,
          this.selected_key,
          "rect_text",
          "text"
        );
        drawRect(
          this.sort_points["keywords"],
          g,
          yScale_keywords,
          "#6A5ACD",
          x_keywords,
          this.selected,
          this.selected_key,
          "rect_keywords",
          "keywords"
        );
        drawRect(
          this.sort_points["t"],
          g,
          yScale_t,
          "#87CEEB",
          x_t,
          this.selected,
          this.selected_key,
          "rect_t",
          "t"
        );
  
        drawAllLines(this.lines, g);
        function drawLine(line, g) {
          var linePath = d3
            .line()
            .x(function (d) {
              return d[0];
            })
            .y(function (d) {
              return d[1];
            });
          g.append("g")
            .append("path")
            .attr("class", "line-path")
            .attr("d", linePath(line))
            .attr("fill", "none")
            .attr("stroke-width", 0.2)
            .attr("stroke", "#6f82bf")
            .attr("opacity", function () {
              return 0.6;
            });
        }
  
        function drawAllLines(lines, g) {
          let number_lines = [];
          lines.forEach((line) => {
            let x0 = getX(line[2]) + rect_width / 2;
            let x1 = getX(line[3]) - rect_width / 2;
            if (x0 > x1) {
              x0 -= rect_width;
              x1 += rect_width;
            }
  
            number_lines.push([
              [x0, getY(line[0], line[2])],
              [x1, getY(line[1], line[3])],
            ]);
          });
          number_lines.forEach((line) => {
            drawLine(line, g);
          });
        }
        function getY(point, key) {
          if (key == "original_text")
            return (
              yScale_original_text(point) + yScale_original_text.bandwidth() / 2
            );
          if (key == "text")
            return yScale_text(point) + yScale_text.bandwidth() / 2;
          if (key == "keywords")
            return yScale_keywords(point) + yScale_keywords.bandwidth() / 2;
          if (key == "name")
            return yScale_name(point) + yScale_name.bandwidth() / 2;
          if (key == "t") return yScale_t(point) + yScale_t.bandwidth() / 2;
          return "";
        }
        function getX(key) {
          if (key == "original_text") return x_original_text + rect_width / 2;
          if (key == "text") return x_text + rect_width / 2;
          if (key == "keywords") return x_keywords + rect_width / 2;
          if (key == "name") return x_name + rect_width / 2;
          if (key == "t") return x_t + rect_width / 2;
          return "";
        }
      },
    },
  };
  </script>
  
  <style>
  div.tooltip {
    position: absolute;
    text-align: center;
    width: 100px;
    /* height: 40px; */
    padding: 2px;
    font: 12px sans-serif;
    background: lightsteelblue;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
  }
  
  div.tooltip2 {
    position: absolute;
    text-align: center;
    width: 100px;
    /* height: 40px; */
    padding: 2px;
    font: 12px sans-serif;
    background: lightsteelblue;
    border: 0px;
    border-radius: 8px;
    pointer-events: none;
  }
  </style>