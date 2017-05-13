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
    tomatoTime: 0.3 * 60 * 1000, // million seconds
    newTaskContent: "Please input new task",
    estimatedTomato: 1,
    workId: -1,
    percent: 0,
    todoList: []
  },
  created: function() {
    localStorage.clear();
    console.debug("VUE create is called");
    todoItems = JSON.parse(localStorage.getItem("todoItems"));
    if (todoItems) {
      this.todoList = todoItems;
    }
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