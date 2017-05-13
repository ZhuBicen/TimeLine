 Vue.component('modal', {
   props:['percent'],
  template: '#modal-template'
})

Vue.component('todo-item', {
  props: ['id', 'todo'],
  template: '<li class="list-group-item"  v-bind:class="{disabled: todo.done}" v-on:mouseover="todo.active = true" v-on:mouseleave="todo.active = false" >' + 
    '{{ todo.text }} {{ todo.used.length }}/{{todo.estimate}}' + 
    '<button class="btn btn-default" v-on:click="$emit(\'start\', id)" v-show="todo.active && !todo.done" type="button" title="开始一个番茄" >Start</button>' +
    '<button class="btn btn-default" v-on:click="$emit(\'done\', id)" v-show="todo.active && !todo.done" type="button" title="完成任务" >Done</button>' +
    '<button class="btn btn-default" v-on:click="$emit(\'delete\', id)" v-show="todo.active && todo.done" type="button" title="删除任务" >Delete</button>' +
    '</li>'
})

var app = new Vue({
  el: '#app',

  data: {
    radius: 40,
    tomatoTime: 0.1 * 60 * 1000, // million seconds
    newTaskContent: "Please input new task",
    estimatedTomato: 1,
    workId: -1,
    percent: 0,
    todoList: [],
    startTime: 0,
    endTime: 0,
  },
  created: function() {
    ////////////////////////////////////
    // localStorage.clear();
    ////////////////////////////////////
    console.debug("VUE create is called");
    todoItems = JSON.parse(localStorage.getItem("todoItems"));
    if (todoItems) {
      this.todoList = todoItems;
    }
    var now = new Date();
    console.log("Now time is:", now.getTime());
    console.log("Now time is:", now);

    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    this.startTime = today.getTime();

    console.log("Start time is:", today);
    console.log("Start time is:", this.startTime);

    this.endTime = this.startTime + 24  * 60 * 60 * 1000;
    console.log("End time is:", this.endTime);

    var tomatoesToShow = [];
    var self = this;
    this.todoList.forEach(function(taskItem) {
      taskItem.used.forEach(function(tomato) {
        if (tomato >= self.startTime && tomato <= self.endTime) {
            tomatoesToShow.push(tomato);
        }
      })
    })

    console.log(tomatoesToShow);


    d3.select("#TimeLine")
      .append("svg")
      .attr("width",  500)
      .attr("height", 500)
      .data(tomatoesToShow)
      .append("circle")
      .attr("cx", function(d) { return Math.random() * (500 - 2 * self.radius) + self.radius; })
      .attr("cy", function(d) { return Math.random() * (500 - 2 * self.radius) + self.radius; })
      .attr("r", self.radius)
      .attr("fill", "#FFCE00"); 

  },
  updated: function() {   
  },
  watch: {
    todoList: {
      handler: function (val, oldVal) {
        console.log('a thing changed');
        localStorage.setItem("todoItems", JSON.stringify(this.todoList));
      },
      deep: true
    }
  },
  methods: {
    start: function(taskId) {
      this.workId = taskId;
      this.percent = 0;
      console.info("Starting task for task:" + taskId);
      var self = this;
      var d = new Date();
      var startTime = d.getTime();
      var interval = setInterval(function() {
        self.percent = self.percent + 10;
        var n = new Date();
        var nowTime = n.getTime();
        self.percent = ((nowTime - startTime) * 100)/ (self.tomatoTime);
        console.log("current percent:", self.percent);
      }, 1000 * 3)
      setTimeout(function() {
        self.todoList[self.workId].used.push(new Date().getTime());

        self.workId = -1;
        self.percent = 100;
        clearInterval(interval);
        notifyRest();
      }, self.tomatoTime)
    },
    done: function(taskId) {
      console.info("Make task done:", taskId);
      this.todoList[taskId].done = true;
    },
    delete: function(taskId) {
      console.info("Delete", taskId);
      this.todoList.splice(taskId, 1);
    },
    newTask: function () {
	    this.todoList.push({ active: false, text: this.newTaskContent, estimate:this.estimatedTomato, used:[], done: false });
      this.newTaskContent = "Please input new task";
      this.estimatedTomato = 1;
    }
  }
})