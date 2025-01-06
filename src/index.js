import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import authServices from "./service/auth.services";
import localStorageService from "./service/localStorage.services";

if (authServices.isExpired()
  && window.location.href.indexOf('/public/') < 0
  && window.location.href.indexOf('/assets/') < 0
  && window.location.href.indexOf('/media/') < 0
  && window.location.href.indexOf('/css/') < 0
  && window.location.href.indexOf('/favicon.ico') < 0
) {
  localStorageService.clear();
  window.location.href = "/logout";
}

window.addEventListener("storage", function () {
  if (authServices.isExpired() && window.location.href.indexOf('/public/') >= 0) {
    localStorageService.clear();
    return (window.location.href = window.location.origin + "/logout");
  }
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);