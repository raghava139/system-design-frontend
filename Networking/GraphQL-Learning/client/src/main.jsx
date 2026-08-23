import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from "@apollo/client/react";
import './index.css'
import App from './App.jsx'
import Client from './ApolloClient.jsx'; 


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={Client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
