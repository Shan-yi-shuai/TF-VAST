<template>
    <div class="container">
        <el-icon><RefreshRight /></el-icon>
        <svg id="svg1" width="300" height="600"></svg>
    </div>
</template>

<style scoped>
.container{
    /* display: flex; */
    /* justify-content: center; */
    /* align-items: center; */
    width: 100%;
    height: 100%;
}
/* #svg1 {
    background-color: rgba(255, 246, 230, 0.54);
} */
</style>

<script>
import * as d3 from "d3";
import { defineComponent } from "vue";
import Data from '../assets/data.json';

export default {
    data(){
      return{
        data: [73,52,33,22,14,68],
      }
    },
    methods: {
        getRandom(totalnum,targetnum) {
            // range:[0,totalnum]
            let final = [];
            //获取0-x的数
            for (let i = 0; i < targetnum; i++) {
                let result = parseInt(Math.random() * totalnum);
                //将数据添加到数组当中
                final[i] = result;
                //进行数组去重
                for (let v = 0; v < final.length; v++) {
                //从当前元素的下一个开始比,当前元素v,下一个元素+1
                for (let j = v + 1; j < final.length; j++) {
                    //判断arr[i]是否相等
                    if (final[v] == final[j]) {
                    //如果相等,删除j
                    final.splice(j, 1);
                    j--; //需要重新比较当前位置,避免相邻位置出现重复数字
                    i--; //需要重新生成当前重复位置的随机数
                    }
                }
                }
            }
            //输出生成的随机数
            console.log(final);
            return final;
        },
        getJson() {
            var obj1 = { a: 0 , b: { c: 0}};
            var obj3 = JSON.parse(JSON.stringify(obj1));//先将obj转换为JSON字符串，然后再转回对象
            obj1.a = 4;
            obj1.b.c = 4;
            console.log(JSON.stringify(obj3));
            obj3.a = 2;
            obj3.b.c = 3;
            console.log(obj1);

            let data = Data.treeArray;
            //console.log(data);
             // category [0-15]
            let key_players = new Object();
            key_players.children = [];
            key_players.name = "virtual node";
            key_players.totalChildren = data.length; // 所有子孙数量
            key_players.childnum = data.length; //其直接儿子数量
            key_players.evtlist = 0;
            key_players.uid = "10000";
            key_players.dep = 0;
            key_players.category = 0;
            let count = -1;
            console.log('data length',data.length);
            for(let i = 0; i < data.length; i++) {
                if(i!=0 && data[i].children[0].totalChildren<40){ //除了第一个大V，后面的大V传播的人数少于20个则在这里不显示出来
                    continue;
                }
                count+=1;
                key_players.children.push({
                    category: data[i].children[0].category,
                    original_text: data[i].children[0].original_text,
                    text: data[i].children[0].text,
                    evtlist: data[i].children[0].evtlist,
                    loc: data[i].children[0].loc,
                    uid: data[i].children[0].uid,
                    name: data[i].children[0].name,
                    dep: data[i].children[0].dep,
                    pid: data[i].children[0].pid,
                    childnum: data[i].children[0].childnum, //儿子数量
                    totalChildren: data[i].children[0].totalChildren, // 所有子孙数量
                    t: data[i].children[0].t,
                    children: JSON.parse(JSON.stringify(data[i].children[0].children))
                });
                //console.log(key_players.children[i],data[i].children[0].children);
                let son_count = -1;
                for(let j = 0; j < key_players.children[count].children.length; j++) {
                    //console.log(j,data[i].children[0].children.length,key_players.children[count].children.length);
                    let son = data[i].children[0].children[j];
                    //console.log(key_players.children[count].children[j].childnum);
                    //console.log(son,son.children,son.children.length);
                    //console.log(JSON.stringify(key_players.children[count].children),data[i].children[0].children);
                    if(key_players.children[count].children[j].childnum === 0){//第二层，如果第二层元素的child数量为0，省去这一层，避免树结构太大
                        key_players.children[count].children.splice(j, 1);
                        j-=1;
                    }else if(j!=0 &&key_players.children[count].children[j].childnum === 1){//第二层，如果第二层元素的child数量为1，只保留一个元素
                        key_players.children[count].children.splice(j, 1);
                        j-=1;
                    }
                    else {
                        this.cleanData(key_players.children[count].children[j]);
                        // for(let k = 0; k < key_players.children[i].children[j].children.length; k++) { // 第三层,所有child数量为0的只保留一个元素就行
                        //     if(k!=0 &&key_players.children[i].children[j].children[k].childnum ===0) {
                        //         key_players.children[i].children[j].children.splice(k, 1);
                        //         k-=1;
                        //     }
                        //     else {
                        //         for(let l = 0; l < key_players.children[i].children[j].children[k].children.length; l++) { // 第四层
                        //             if(l!=0 &&key_players.children[i].children[j].children[k].children[l].childnum ===0) {
                        //                 key_players.children[i].children[j].children[k].children.splice(l, 1);
                        //                 l-=1;
                        //             }
                        //             else {
                        //                 for(let p = 0; p < key_players.children[i].children[j].children[k].children[l].children.length; p++) { // 第五层
                        //                     if(p!=0 &&key_players.children[i].children[j].children[k].children[l].children[p].childnum ===0) {
                        //                         key_players.children[i].children[j].children[k].children[l].children.splice(p, 1);
                        //                         p-=1;
                        //                     }
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }
                    }
                    //console.log(JSON.stringify(key_players.children[i].children));
                    // if(son.children.length>0){
                    //     son_count += 1;
                    //     console.log("push",son_count);
                    //     key_players.children[i].children.push({
                    //         category: son.category,
                    //         original_text: son.original_text,
                    //         text: son.text,
                    //         evtlist: son.evtlist,
                    //         loc: son.loc,
                    //         uid: son.uid,
                    //         name: son.name,
                    //         dep: son.dep,
                    //         pid: son.pid,
                    //         childnum: son.childnum, //儿子数量
                    //         totalChildren: son.totalChildren, // 所有子孙数量
                    //         t: son.t,
                    //         children: []
                    //     });
                    //     //console.log(key_players.children[i].children[son_count]);
                    //     let grandson_count = -1;
                    //     for(let k = 0; k < son.children.length; k++) {
                    //         let grandson = son.children[k];
                    //         //console.log(grandson,grandson.children,grandson.children.length);
                    //         if(grandson.children.length > 0) {
                    //             grandson_count+= 1;
                    //             key_players.children[i].children[son_count].children.push(grandson);
                    //         }
                    //     }
                    // }
                }
                
            }
            console.log(key_players.children.length, key_players);
            return key_players;
        },
        cleanData(obj){
            for(let i = 0; i < obj.children.length;i++) {
                if(i!=0&&(obj.children[i].childnum===0 || obj.children[i].childnum===1)){
                    obj.children.splice(i, 1);
                    i-=1;
                }else {
                    this.cleanData(obj.children[i]);
                }
            }
        },
        drawTree() {
            let ddata = this.getJson();
            let arr = [];
            this.getArr(arr,ddata);
            console.log(arr);
            let childMax = d3.max(arr,function(d){return d.totalChildren;});
            console.log(childMax);
            let radiusScale = d3.scaleLinear()
            .domain([0, childMax])
            .range([2.5,10]);
        
            const svg = d3.select("#svg1");
            const width = svg.attr("height");
            const height = svg.attr("width");
            console.log(width,height,svg);
            let padding = 0;
            const treeMap = svg.append("g")
                .attr("transform","translate(" + padding+"," + padding +")");
            const treeData = d3.tree()
                .size([width - 6 * padding, height - 2 * padding])
                // 节点之间间隔
                .separation(function (a, b) {
                    return (a.parent == b.parent ? (radiusScale(a.data.totalChildren)+radiusScale(b.data.totalChildren)+0.5) :
                    (radiusScale(a.data.totalChildren)+radiusScale(b.data.totalChildren)+1)) / a.depth;
                })(
                    // 创建层级布局，对源数据进行数据转换
                    d3.hierarchy(ddata).sum(function (d) {
                        // console.log(d,d.value);
                        return d.name;
                    })
                );
            // console.log(treeData);
            let treeData2 = [];
            // 按照depth去分组获得颜色值
            this.getTreeArr(treeData2, treeData);
            // console.log(treeData2);
            
            let time = [];
            for(let i = 0; i < treeData2.length; i++) {
                time.push(treeData2[i].data.t);
            }
            // console.log(time.indexOf(1477971664));
            // console.log(time);
            let dept_scale = d3.scaleLinear().domain([0,time.length-1]).range([0,1]);
            // 贝塞尔曲线生成器
            let Bezier_curve_generator = d3.linkHorizontal()
                .x(function (d) {
                    return d.y;
                })
                .y(function (d) {
                    return d.x;
                });
            //绘制边
            treeMap.selectAll("path")
                .data(treeData.links())
                .enter()
                .append("path")
                .attr("d", function (d) {
                    // 根据name值的长度调整连线的起点
                    var start = {x: d.source.x, y: d.source.y};// + d.source.data.name.length * 16+0};
                    var end = {x: d.target.x, y: d.target.y};
                    return Bezier_curve_generator({source: start, target: end});
                })
                .attr("fill", "none")
                .attr("stroke", "#838B8B79")
                .attr("stroke-width", 1);
            // 创建分组——节点+文字
            let groups = treeMap.selectAll("g")
            // 节点 nodes
                .data(treeData.descendants())
                .enter()
                .append("g")
                .attr("transform", function (d) {
                    var cx = d.x;
                    var cy = d.y;
                    return "translate(" + cy + "," + cx + ")";
                });
            console.log(groups);
            //绘制节点
            groups.append("circle")
                // .attr("transform", function (d) {
                //     console.log(d);
                //     var cx = d.x;
                //     var cy = d.y;
                //     return "translate(" + cy + "," + cx + ")";
                // })
                .attr("r", 
                    function (d) {
                    return radiusScale(d.data.totalChildren);
                })
                
                // .attr("cx",function (d) {return d.x;})
                // .attr("cy",function (d) {return d.y;})
                .attr("fill", function (d) {
                    
                    if(time.indexOf(d.data.t) == -1){
                        return "black";
                    }
                    //console.log(time.indexOf(d.data.t),dept_scale(time.indexOf(d.data.t)));
                    return d3.interpolateWarm(dept_scale(time.indexOf(d.data.t)));
                    
                })
                // .attr("stroke", "red")
                // .attr("stroke-width", 1)
                .on("mouseover", function (event,d) {
                    // console.log(d)
                    treeMap
                    .append("text")
                    .attr("class",'text')
                    .attr("x", function (){ 
                        // console.log(d.x);
                        return d.y;})
                    .attr("y", function (){ return d.x-12;})
                    .text(function(){return d.data.name+","+d.data.totalChildren;}
                    );
                })
                .on("mouseout",function(d){
                    d3.selectAll('.text').remove();
                });
                //添加图例
		let pad =2, legend_width = 10, legend_height = 10,start_height = 10;
		let legend = [{'x':0,'y':legend_height},{'x':0,'y':legend_height*2},
					{'x':0,'y':legend_height*3},{'x':0,'y':legend_height*4},{'x':0,'y':legend_height*5},
					{'x':0,'y':legend_height*6},{'x':0,'y':legend_height*7},{'x':0,'y':legend_height*8},
                    {'x':0,'y':legend_height*9}];
		svg.selectAll('.legend')
			.append('g')
			.data(legend)
			.enter()
			.append('rect')
			.attr('class','legend')
			.attr('transform', 'translate('+(290 - 3*padding)+',' + start_height+')')
			.attr('x',function (d) {return d.x;})
			.attr('y',function (d) {return d.y;})
			.attr('width', 10)
			.attr('height',10)
			.style('fill',function (d,i) {
                return d3.interpolateWarm(i/(legend.length-1));});
        let text_height = start_height+7;
        svg.append("text")
           .attr('transform', 'translate('+(290 - 3*padding)+',' + text_height+')')
           .attr('x',1)
           .attr('y',0)
           .text("t")
           .style("font-size","12pt");
        // 箭头
        let defs = svg.append('defs');
        //添加marker标签及其属性
        let arrowMarker = defs.append('marker')
        .attr('id','arrow')
        .attr('markerUnits','strokeWidth')
        .attr('markerWidth',6)
        .attr('markerHeight',6)
        .attr('viewBox','0 0 12 12')
        .attr('refX',6)
        .attr('refY',6)
        .attr('orient','auto');
        //绘制直线箭头
        const arrow_path = 'M2,2 L10,6 L2,10 L6,6 L2,2';
        arrowMarker.append('path')
        .attr('d',arrow_path)
        .attr('fill','#000');
        //绘制直线
        let a = start_height+legend_height;
        let b = start_height+legend_height*(legend.length+1);
        console.log(a,b);
        const line = svg.append('line')
        .attr('x1',width - 3*padding + legend_width + 6)
        .attr('y1',start_height+legend_height)
        .attr('x2',width - 3*padding + legend_width + 6)
        .attr('y2',start_height+legend_height*(legend.length+1))
        .attr('stroke','black')
        .attr('stroke-width',2)
        .attr('marker-end','url(#arrow)');

        },
        getArr(arr,obj) {
            for(let i = 0; i < obj.children.length; i++) {
                arr.push(obj.children[i]);
                if(obj.children[i].children.length == 0) {
                    // if(obj[key].totalChildren>max){
                    //     max=obj[key].totalChildren;
                    // }
                    arr.push(obj.children[i]);
                }
                if(obj.children[i].children.length > 0) {
                    this.getArr(arr,obj.children[i]);
                }
            }
        },
        getTreeArr(arr,obj){
            //console.log(obj);
            if(obj.children) {
                for(let i = 0; i < obj.children.length; i++) {
                    //console.log(obj.children[i]);
                    arr.push(obj.children[i]);
                    if(obj.children[i].children) {
                        //console.log('++++');
                        this.getTreeArr(arr,obj.children[i]);
                    }
                    else {
                        arr.push(obj.children[i]);
                    }
                }
            }
        }
    },
    mounted() {

        //this.getJson();

        this.drawTree();
    }
}
</script>