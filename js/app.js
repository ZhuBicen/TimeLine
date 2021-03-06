Vue.component('modal', {
    props: ['percent'],
    template: '#modal-template'
})


Vue.component('todo-item', {
    props: ['id', 'todo'],
    template: '<li v-show="!todo.hide" class="list-group-item"  v-bind:class="{\'list-group-item-success\': todo.punchIn}" v-on:mouseover="todo.active = true" v-on:mouseleave="todo.active = false" >' +
        '{{ todo.text }} {{ todo.used.length }}/{{todo.estimate}}' +
        '<button class="btn btn-success btn-xs" v-on:click="start" v-show="todo.active && !todo.done" type="button" title="开始一个番茄" >Start</button>' +
        '<button class="btn btn-success btn-xs" v-on:click="done" v-show="todo.active && !todo.done" type="button" title="完成任务" >Done</button>' +
        '<button class="btn btn-success btn-xs" v-on:click="delete" v-show="todo.active && todo.done" type="button" title="删除任务" >Delete</button>' +
        '<button class="btn btn-success btn-xs" v-on:click="unfollow" v-show= "todo.active" type="button" title="以后再说">Unfollow</button>' +
        '</li>',
    methods: {
        start: function () {
            this.$emit('start', this.id);
        },
        delete: function () {
            this.$emit('delete', this.id);
        },
        unfollow: function () {
            this.$emit('unfollow', this.id);
        },
        done: function () {
            this.$emit('done', this.id);
        }

    }
})

Vue.component('future-item', {
    props: ['id', 'todo'],
    template: '<li class="list-group-item"  v-show="!todo.hide" v-bind:class="{disabled: todo.done}" v-on:mouseover="todo.active = true" v-on:mouseleave="todo.active = false" >' +
        '{{ todo.text }} {{ todo.used.length }}/{{todo.estimate}}' +
        '<button class="btn btn-success btn-xs" v-on:click="delete" v-show="todo.active" type="button" title="删除任务" >Delete</button>' +
        '<button class="btn btn-success btn-xs" v-on:click="follow" v-show="todo.active" type="button" title="今日完成">Follow</button>' +
        '</li>',
    methods: {
        delete: function () {
            this.$emit('delete', this.id);
        },
        follow: function () {
            this.$emit('follow', this.id);
        },
    }
})

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
    //  '#'+Math.floor(Math.random()*16777215).toString(16);
}
var global_work_id = -1;
window.onbeforeunload = function () {
    console.log("Before unload event");
    if (global_work_id == -1) {
        console.log("Not working");
        return undefined;
    }
    return 'Are you sure you want to leave?';
};

var g_TomatoTime;
var g_RestTime;

if (window.location.port == 3001) { // for debug purpose
    g_TomatoTime = 1; // minutes
    g_RestTime = 0.5;
} else {
    g_TomatoTime = 25;
    g_RestTime = 5;
}

var app = new Vue({
    el: '#app',

    data: {
        radius: 40,
        tomatoTime: g_TomatoTime * 60 * 1000, // million seconds
        restTime: g_RestTime * 60 * 1000,
        newTaskContent: "Please input new task",
        estimatedTomato: 1,
        workId: -1,
        percent: 0,
        todoList: [],
        futureList: [],
        startTime: 0,
        endTime: 0,
        tomatoFinshTimeout: undefined,
        statusUpdateInterval: undefined,
        xScale: undefined,
    },
    created: function () {
        {
            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            var lastDay = new Date(2018, 11, 31); // 0 ~ 11 month
            var now = new Date();
            var diffDays = Math.round(Math.abs((now.getTime() - lastDay.getTime()) / (oneDay)));
            document.getElementById("CountDownDays").innerHTML = diffDays;
        }
        ////////////////////////////////////
        // localStorage.clear();
        ////////////////////////////////////
        console.debug("VUE create is called");
        var self = this;

        todoItems = JSON.parse(localStorage.getItem("todoItems"));
        if (todoItems) {
            this.todoList = todoItems;
        }

        futureItems = JSON.parse(localStorage.getItem("futureItems"));
        if (futureItems) {
            this.futureList = futureItems;
        }

        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        this.startTime = today.getTime();
        this.endTime = this.startTime + 24 * 60 * 60 * 1000;

        var tomatoesToShow = [];

        this.todoList.forEach(function (taskItem) {
            taskItem.punchIn = false;
            taskItem.used.forEach(function (tomato) {
                if (tomato >= self.startTime && tomato <= self.endTime) {
                    tomatoesToShow.push(tomato);
                    taskItem.punchIn = true;
                }
            })
        })

        console.log(this.todoList);
        console.log(tomatoesToShow);

        var timeLineSvg = document.getElementById('TimeLine');
        console.log('client', timeLineSvg.clientWidth + ' x ' + timeLineSvg.clientHeight);

        this.xScale = d3.scaleLinear()
            .range([0, timeLineSvg.clientWidth])
            .domain([self.startTime, self.endTime]);

        var self = this
        d3.select("#TimeLine")
            .append("line")
            .attr("x1", 0)
            .attr("y1", 3)
            .attr("x2", timeLineSvg.clientWidth)
            .attr("y2", 0)
            .attr("style", "stroke-width:3;stroke:rgb(255,0,0);");


        d3.select("#TimeLine")
            .selectAll("rect")
            .data(tomatoesToShow)
            .enter()
            .append("rect")
            .attr("x", function (d) { return self.xScale(d); })
            .attr("y", 0)
            .attr("width", self.xScale(self.startTime + self.tomatoTime))
            .attr("height", 50)// to be extract as const, deinfed in html
            .attr("fill", function (d) { return getRandomColor(); });

    },
    updated: function () {
    },
    watch: {
        todoList: {
            handler: function (val, oldVal) {
                // console.log('todo list changed', new Date().getTime());
                localStorage.setItem("todoItems", JSON.stringify(this.todoList));
            },
            deep: true
        },

        futureList: {
            handler: function (val, oldVal) {
                // console.log('future list changed', new Date().getTime());
                localStorage.setItem("futureItems", JSON.stringify(this.futureList));
            },
            deep: true
        }
    },
    methods: {

        start: function (taskId) {
            this.workId = taskId;
            global_work_id = taskId;
            this.percent = 0;
            console.info("Starting task for task:" + taskId);
            var self = this;
            var d = new Date();
            var startTime = d.getTime();
            this.statusUpdateInterval = setInterval(function () {
                self.percent = self.percent + 10;
                var n = new Date();
                var nowTime = n.getTime();
                self.percent = ((nowTime - startTime) * 100) / (self.tomatoTime);
                console.log("current percent:", self.percent);
            }, 1000 * 3)
            this.tomatoFinshTimeout = setTimeout(function () {
                self.todoList[self.workId].used.push(startTime);

                self.todoList[global_work_id].punchIn = true;
                self.workId = -1;
                self.percent = 100;
                global_work_id = -1;
                clearInterval(self.statusUpdateInterval);

                notifyRest(self.restTime);

                d3.select("#TimeLine")
                    .append("rect")
                    .attr("x", function (d) { return self.xScale(startTime); })
                    .attr("y", 0)
                    .attr("width", self.xScale(self.startTime + self.tomatoTime))
                    .attr("height", 50) // TODO: extracted from html 
                    .attr("fill", function (d) { return getRandomColor(); });
            }, self.tomatoTime)
        },
        done: function (taskId) {
            console.info("Make task done:", taskId);
            this.todoList[taskId].done = true;
        },

        delete: function (taskId, component) {
            console.info("Delete", taskId, component);
            if (component == "future") {
                this.futureList[taskId].hide = true;
            }
            if (component == "today") {
                this.todoList[taskId].hide = true;
            }
        },

        deleteTodoItem: function (taskId) {
            console.info("Delete", taskId);
            this.todoList[taskId].hide = true;
        },

        deleteFutureItem: function (taskId) {
            console.info("Delete", taskId);
            this.futureList[taskId].hide = true;
        },

        newTask: function () {
            this.todoList.push({ active: false, text: this.newTaskContent, estimate: this.estimatedTomato, used: [], done: false, hide: false, followToday: false, punchIn: false });
            this.newTaskContent = "Please input new task";
            this.estimatedTomato = 1;
        },

        follow: function (taskId) {
            console.info("follow", taskId);
            this.futureList[taskId].active = false;
            this.todoList.push(this.futureList[taskId]);
            this.futureList.splice(taskId, 1);
        },

        unfollow: function (taskId) {
            console.info("unfollow", taskId);
            this.todoList[taskId].active = false;
            this.futureList.push(this.todoList[taskId]);
            console.info(this.futureList);
            this.todoList.splice(taskId, 1);

        },
    }
})