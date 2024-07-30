import { createApp } from 'vue';
import App from './App.vue';
import { provideApolloClient } from '@vue/apollo-composable';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';
import './styles/tailwind.css';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const app = createApp(App);

provideApolloClient(apolloClient);

app.mount('#app');
