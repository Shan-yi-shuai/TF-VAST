import { defineStore } from "pinia";
import tree from "../assets/tree_data.json";
import Sentiment from 'sentiment';
//定义并导出容器 policy是容器的名称
export const useWeibodataStore = defineStore("weibodata", {
    state: () => {
        return {
            data: tree,
            selected: [],
            selected_key: [],
            weibo_graph: {},
            key: ['name', 'original_text', 'text', 'keywords', 't'],
            start: new Date(-8640000000000000),
            end: new Date(),
        };
    },
    //有缓存功能
    getters: {
        choice_data: (state) => {
            return state.data.filter(d => state.start < new Date(d.t + ":00:00") && new Date(d.t + ":00:00") < state.end);
        },
        weibo_key: (state) => {
            return Object.keys(state.choice_data[0]);
        },
        name_list: (state) => {
            let list = [];
            state.choice_data.forEach(info => {
                if (!list.includes(info.name)) list.push(info.name);
            })
            return list;
        },
        original_text_list: (state) => {
            console.log(state.choice_data)
            let list = [];
            state.choice_data.forEach(info => {
                if (!list.includes(info.original_text)) list.push(info.original_text);
            })
            return list;
        },
        text_list: (state) => {
            let list = [];
            state.choice_data.forEach(info => {
                if (!list.includes(info.text)) list.push(info.text);
            })
            return list;
        },
        keywords_list: (state) => {
            let list = [];
            state.choice_data.forEach(info => {
                info.keywords.forEach(keyword => {
                    if (!list.includes(keyword)) list.push(keyword);
                })
            })
            return list;
        },
        t_list: (state) => {
            let list = [];
            state.choice_data.forEach(info => {
                if (!list.includes(info.t)) list.push(info.t);
            })
            return list;
        },
        // 统计每个时间段的微博数量
        date_num: (state) => {
            const dict = {}
            const list = []
            state.choice_data.forEach(info => {
                // const timestamp = Date.parse(info.t)
                // const date = new Date(timestamp)
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
            state.choice_data.forEach(info => {
                // const timestamp = Date.parse(info.t)
                // const date = new Date(timestamp)
                if (dict[info.t] === undefined) dict[info.t] = 0
                dict[info.t]++
            })
            for (let date in dict) {
                list.push({ date: date.split(' ')[0], num: dict[date] })
            }
            list.sort((a, b) => new Date(a.date) - new Date(b.date))
            return list
        },
        word_list: (state) => {
            const dict = {}
            const list = []
            state.choice_data.forEach(info => {
                info.keywords.forEach(d => {
                    if (d !== null) {
                        if (dict[d] === undefined) dict[d] = 0
                        dict[d]++
                    }
                })
            })
            for (let word in dict) {
                list.push({ text: word, size: dict[word] })
            }
            // for (let word in dict) {
            //     list.push([word, dict[word]])
            // }

            return list.filter(d => (d.text !== "微博" || d.text !== "转发") && d.size > 1)
        },
        graph: (state) => {
            const nodes = state.word_list
            const links = {}
            const link_list = []

            state.choice_data.forEach(item => {
                const keywords = item.keywords;
                for (let i = 0; i < keywords.length - 1; i++) {
                    if (keywords[i] === null) break
                    for (let j = i + 1; j < keywords.length; j++) {
                        if (keywords[j] === null) break
                        const word1 = keywords[i];
                        const word2 = keywords[j];
                        const key1 = `${word1}-${word2}`;
                        const key2 = `${word2}-${word1}`;

                        if (links[key1]) {
                            links[key1].value++;
                        } else if (links[key2]) {
                            links[key2].value++;
                        } else {
                            links[key1] = { source: word1, target: word2, value: 1 };
                        }
                    }
                }
            })

            for (let link in links) {
                link_list.push(links[link])
            }

            return {
                nodes,
                links: link_list.filter(d =>
                    d.source !== "微博" && d.source !== "转发" &&
                    d.target !== "微博" && d.target !== "转发" &&
                    d.value > 1)
            }

        }
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