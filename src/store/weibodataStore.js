import { defineStore } from "pinia";
import tree from "../assets/tree_data.json";
//定义并导出容器 policy是容器的名称
export const useWeibodataStore = defineStore("weibodata", {
    state: () => {
        return {
            data: tree,
            selected: [],
            selected_key: [],
            weibo_graph: {},
            key: ['name', 'original_text', 'text', 'keywords', 't']
        };
    },
    //有缓存功能
    getters: {
        weibo_key: (state) => {
            return Object.keys(state.data[0]);
        },
        name_list: (state) => {
            let list = [];
            state.data.forEach(info => {
                if (!list.includes(info.name)) list.push(info.name);
            })
            return list;
        },
        original_text_list: (state) => {
            let list = [];
            state.data.forEach(info => {
                if (!list.includes(info.original_text)) list.push(info.original_text);
            })
            return list;
        },
        text_list: (state) => {
            let list = [];
            state.data.forEach(info => {
                if (!list.includes(info.text)) list.push(info.text);
            })
            return list;
        },
        keywords_list: (state) => {
            let list = [];
            state.data.forEach(info => {
                info.keywords.forEach(keyword => {
                    if (!list.includes(keyword)) list.push(keyword);
                })
            })
            return list;
        },
        t_list: (state) => {
            let list = [];
            state.data.forEach(info => {
                if (!list.includes(info.t)) list.push(info.t);
            })
            return list;
        },
        // 统计每个时间段的微博数量
        date_num: (state) => {
            const dict = {}
            const list = []
            state.data.forEach(info => {
                // const timestamp = Date.parse(info.t)
                // const date = new Date(timestamp)
                if (info.t.includes('2017')) console.log(info.t)
                if (dict[info.t] === undefined) dict[info.t] = 0
                dict[info.t]++
            })
            for (let date in dict) {
                list.push({ date: date + ':00:00', num: dict[date] })
            }
            list.sort((a, b) => new Date(a.date) - new Date(b.date))
            return list
        },
        date_num2: (state) => {
            const dict = {}
            const list = []
            state.data.forEach(info => {
                // const timestamp = Date.parse(info.t)
                // const date = new Date(timestamp)
                if (info.t.includes('2017')) console.log(info.t)
                if (dict[info.t] === undefined) dict[info.t] = 0
                dict[info.t]++
            })
            for (let date in dict) {
                list.push({ date: date.split(' ')[0], num: dict[date] })
            }
            list.sort((a, b) => new Date(a.date) - new Date(b.date))
            return list
        },
    },
    actions: {
        addKey(key) {
            this.selected.push(key)
        },
        deleteKey(key) {
            this.selected.splice(this.selected.indexOf(key), 1);
        },
        findKey(point) {
            if (this.name_list.includes(point)) return "name";
            if (this.original_text_list.includes(point)) return "original_text";
            if (this.text_list.includes(point)) return "text";
            if (this.keywords_list.includes(point)) return "keywords";
            if (this.t_list.includes(point))
                return "t";
            return "";
        },
    },
});