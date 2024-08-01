const { Todo } = require('./models/Todo');

const resolvers = {
  Query: {
    todos: async () => await Todo.find(),
  },
  Mutation: {
    addTodo: async (_, { text }) => {
      const todo = new Todo({ text, completed: false });
      await todo.save();
      return todo;
    },
    toggleTodo: async (_, { id }) => {
      const todo = await Todo.findById(id);
      if (!todo) throw new Error('Todo not found');
      todo.completed = !todo.completed;
      await todo.save();
      return todo;
    },
    removeTodo: async (_, { id }) => {
      const todo = await Todo.findByIdAndDelete(id)
      if (!todo) throw new Error('Todo not found');
      return todo;
    },
  },
};

module.exports = { resolvers };
