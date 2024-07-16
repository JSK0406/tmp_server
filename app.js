const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const todoFilePath = path.join('./', 'todo.json');
const counterFilePath = path.join('./', 'counter.json')

// Middleware 설정
app.use(bodyParser.json());

// todo.json 파일에서 데이터 로드 함수
const loadTodoData = () => {
    if (fs.existsSync(todoFilePath)) {
        const data = fs.readFileSync(todoFilePath);
        return JSON.parse(data);
    } else {
        return { data: [] };
    }
};

// todo.json 파일에 데이터 저장 함수
const saveTodoData = (data) => {
    fs.writeFileSync(todoFilePath, JSON.stringify(data, null, 2));
};

const loadLastId = () => {
    if (fs.existsSync(counterFilePath)) {
        const data = fs.readFileSync(counterFilePath);
        return JSON.parse(data).lastId;
    } else {
        return 0;
    }
};

const saveLastId = (lastId) => {
    fs.writeFileSync(counterFilePath, JSON.stringify({ lastId }));
};

const generateUniqueId = () => {
    const lastId = loadLastId();
    const newId = lastId + 1;
    saveLastId(newId);
    return newId;
};

// GET /todo 요청 처리
app.get('/todo', (req, res) => {
    const todoData = loadTodoData();
    res.json(todoData);
});

// POST /todo/change 요청 처리: id1과 id2의 순서를 변경
app.post('/todo/change', (req, res) => {
    const { id1, id2 } = req.body;
    const todoData = loadTodoData();
    const index1 = todoData.data.findIndex(item => item.id === id1);
    const index2 = todoData.data.findIndex(item => item.id === id2);

    if (index1 === -1 || index2 === -1) {
        return res.status(404).send('Todo item not found');
    }

    // 순서 변경
    [todoData.data[index1], todoData.data[index2]] = [todoData.data[index2], todoData.data[index1]];

    saveTodoData(todoData);
    res.json(todoData);
});

// POST /todo 요청 처리: 해당 title 추가
app.post('/todo', (req, res) => {
    const { title } = req.body;
    const todoData = loadTodoData();
    const newTodo = { "title": title, "id": generateUniqueId() };

    // 기존 데이터에 새 객체 추가
    todoData.data.push(newTodo);

    saveTodoData(todoData);
    res.json(todoData);
});

// DELETE /todo/:id 요청 처리: 해당 id의 데이터를 삭제
app.delete('/todo/:id', (req, res) => {
    const { id } = req.params;
    const todoData = loadTodoData();
    const newTodoData = {
        data: todoData.data.filter(item => item.id !== parseInt(id))
    };

    saveTodoData(newTodoData);
    res.json(newTodoData);
});

// PUT /todo/:id 요청 처리: 해당 id의 title을 변경
app.put('/todo/:id', (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const todoData = loadTodoData();
    const todoItem = todoData.data.find(item => item.id === parseInt(id));

    if (!todoItem) {
        return res.status(404).send('Todo item not found');
    }

    // title 변경
    todoItem.title = title;

    saveTodoData(todoData);
    res.json(todoData);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
