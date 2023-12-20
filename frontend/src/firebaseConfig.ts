import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPzYr4HhgYk6ffiy6zSQdoYifGVBpRDHM",
  authDomain: "clearanalytics-dev.firebaseapp.com",
  databaseURL: "https://clearanalytics-dev-default-rtdb.firebaseio.com",
  projectId: "clearanalytics-dev",
  storageBucket: "clearanalytics-dev.appspot.com",
  messagingSenderId: "365364686206",
  appId: "1:365364686206:web:d3f2279a0a4c9004c4d72f",
  measurementId: "G-HWLMKJN2ZQ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = app?.options?.apiKey ? getAuth() : null;
const db = app?.options?.apiKey ? getFirestore(app) : null;

export { app, firebaseConfig, auth, db };
