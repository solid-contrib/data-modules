import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// import { bootSoukai } from './utils.ts'
import { RecoilRoot } from 'recoil'
import { ChakraProvider } from '@chakra-ui/react'


// bootSoukai()


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </RecoilRoot>
  </React.StrictMode>,
)
