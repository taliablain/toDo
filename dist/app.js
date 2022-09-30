"use strict";

//var jsdom = require("jsdom");
//const { JSDOM } = jsdom;

var STATUS;
(function (STATUS) {
    STATUS[STATUS["Pending"] = 0] = "Pending";
    STATUS[STATUS["Finished"] = 1] = "Finished";
})(STATUS || (STATUS = {}));
// validation for todo input
function validate(todo) {
    let isValid = true;
    if (todo.min && todo.text.length < todo.min) {
        isValid = false;
    }
    return isValid;
}
//TodoInput structure
class TodoStructure {
    constructor(id, input, status) {
        this.id = id;
        this.input = input;
        this.status = status;
    }
}
// state management - global storage of todo items
class AppState {
    constructor() {
        this.todos = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new AppState();
        return this.instance;
    }
    //todoItems rerender when todoList changes
    getTodoList() {
        new TodoList(this.todos, 'Pending');
        new TodoList(this.todos, 'Finished');
    }
    //addTodo
    addTodo(id, input, status) {
        const todoItem = new TodoStructure(id, input, status);
        this.todos.push(todoItem);
        //console.log(this.todos);
        this.getTodoList();
    }
    //set method - set todoItems after it is edited/deleted
    set Todos(todoItems) {
        this.todos = [...todoItems];
        this.getTodoList();
    }
    //get method - to access todoList
    get Todos() {
        return this.todos;
    }
}
const appState = AppState.getInstance();
// creating a list which appends to ul
class TodoItem {
    constructor(id, input, todoItems) {
        this.id = id;
        this.input = input;
        this.todoItems = todoItems;
        this.tempElement = document.querySelector('template');
        this.ulElement = document.querySelector('ul');
        const importedHtml = document.importNode(this.tempElement.content, true);
        this.liElement = importedHtml.firstElementChild;
        this.attach();
        this.display();
        this.deleteTodo();
        this.editTodo();
    }
    attach() {
        console.log(this.todoItems, this.liElement, this.ulElement);
        this.ulElement.insertAdjacentElement('afterbegin', this.liElement);
    }
    display() {
        this.ulElement.querySelector('h1').textContent = this.input;
        this.ulElement.querySelector('.del').id = this.id;
        this.ulElement.querySelector('.edit').id = this.id;
    }
    // delete by its id and updating todolist using set method
    deleteItem(id, todoItems) {
        const removedTodo = todoItems.filter((todo) => todo.id !== id);
        appState.Todos = removedTodo;
    }
    deleteHandler() {
        if (document.querySelector('input').value) {
            alert('Todo already selected');
            return;
        }
        const id = this.id.toString();
        const todoItems = [...appState.Todos];
        this.deleteItem(id, todoItems);
    }
    //list item selected is transferred to text input field 
    editHandler() {
        if (document.querySelector('input').value) {
            alert('Todo already selected');
            return;
        }
        const id = this.id.toString();
        const todoItems = [...appState.Todos];
        const getText = todoItems.find((todo) => todo.id === id);
        document.querySelector('input').value = getText.input;
        this.deleteItem(id, todoItems);
    }
    deleteTodo() {
        this.liElement
            .querySelector('.del')
            .addEventListener('click', this.deleteHandler.bind(this));
    }
    editTodo() {
        this.liElement
            .querySelector('.edit')
            .addEventListener('click', this.editHandler.bind(this));
    }
}
// looping over todoList and creating an object for individual todo item
class TodoList {
    constructor(todoItems, type) {
        this.todoItems = todoItems;
        this.type = type;
        this.display();
        console.log(this.type);
    }
    display() {
        document.querySelector('ul').innerText = '';
        for (let todo of this.todoItems) {
            new TodoItem(todo.id, todo.input, this.todoItems);
        }
    }
}
class TodoInput {
    constructor() {
        this.todoInput = document.querySelector('input');
        this.submitButton = document.querySelector('.addTodo');
        this.submit();
    }
    validation(value) {
        const checkInput = validate({
            text: value,
            min: 3,
        });
        if (!checkInput) {
            alert('Invalid input');
            return;
        }
        return value;
    }
    clearFormInput() {
        this.todoInput.value = '';
    }
    // adding todoInput by using addTodo method (in AppState)
    submitHandler(e) {
        e.preventDefault();
        console.log('event');
        const getTodoValue = this.todoInput.value;
        const ValidatedText = this.validation(getTodoValue);
        if (ValidatedText) {
            const id = Math.random().toString();
            appState.addTodo(id, ValidatedText, STATUS.Pending);
            this.clearFormInput();
        }
        else {
            this.clearFormInput();
        }
    }
    submit() {
        console.log(this.submitButton, this.todoInput);
        this.submitButton.addEventListener('click', this.submitHandler.bind(this));
    }
}
const todo = new TodoInput();
