import React from 'react';
import {createRoot} from 'react-dom/client';
import CRM from './App';
import './style.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><CRM/></React.StrictMode>);
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{});});}
