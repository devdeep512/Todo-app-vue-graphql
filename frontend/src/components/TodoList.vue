<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Todo List</h1>
    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">Error: {{ error.message }}</div>
    <div v-else>
      <form @submit.prevent="addTodo" class="flex mb-4">
        <input
          type="text"
          v-model="newTodo"
          placeholder="Add a new todo"
          class="border border-gray-300 rounded p-2 flex-grow"
        />
        <button type="submit" class="bg-blue-500 text-white rounded px-4 py-2 ml-2">
          Add Todo
        </button>
      </form>
      <ul>
        <li
          v-for="todo in todos"
          :key="todo.id"
          class="flex items-center mb-2 p-2 border border-gray-200 rounded"
        >
          <input
            type="checkbox"
            :checked="todo.completed"
            @change="toggleTodo(todo.id)"
            class="mr-2"
          />
          <span :class="{ 'line-through text-gray-500': todo.completed }">{{ todo.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

// Define GraphQL operations
const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      text
      completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      id
      text
      completed
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`;

export default defineComponent({
  setup() {
    // Fetch todos
    const { result, loading, error } = useQuery(GET_TODOS);
    const todos = computed(() => result.value?.todos ?? []);

    const newTodo = ref('');

    // Add todo mutation
    const { mutate: addTodoMutation } = useMutation(ADD_TODO, {
      update(cache, { data: { addTodo } }) {
        const data = cache.readQuery<{ todos: any[] }>({ query: GET_TODOS });
        cache.writeQuery({
          query: GET_TODOS,
          data: { todos: [...(data?.todos ?? []), addTodo] },
        });
      },
    });

    // Handle add todo
    const addTodo = async () => {
      if (!newTodo.value.trim()) {
        console.error('Todo text is empty!');
        return;
      }
      try {
        console.log('Adding todo with text:', newTodo.value);
        const response = await addTodoMutation({ text: newTodo.value }); // Correct variable usage
        console.log('Mutation response:', response);
        newTodo.value = '';
      } catch (err) {
        console.error('Error adding todo:', err);
      }
    };

    // Toggle todo mutation
    const { mutate: toggleTodoMutation } = useMutation(TOGGLE_TODO, {
      update(cache, { data: { toggleTodo } }) {
        const data = cache.readQuery<{ todos: any[] }>({ query: GET_TODOS });
        const updatedTodos = data?.todos.map(todo =>
          todo.id === toggleTodo.id ? { ...todo, completed: toggleTodo.completed } : todo
        );
        cache.writeQuery({
          query: GET_TODOS,
          data: { todos: updatedTodos },
        });
      },
    });

    // Handle toggle todo
    const toggleTodo = async (id: string) => {
      try {
        await toggleTodoMutation({ id });
      } catch (err) {
        console.error('Error toggling todo:', err);
      }
    };

    return {
      todos,
      newTodo,
      addTodo,
      toggleTodo,
      loading,
      error,
    };
  },
});
</script>

<style scoped>
.line-through {
  text-decoration: line-through;
}
</style>
