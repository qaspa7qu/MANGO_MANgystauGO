import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ВСТАВЬ СВОЙ КОНФИГ СЮДА ИЗ КОНСОЛИ FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBwmLvoAsMNUQ-ov5BR7Vjd_N6nqiGEQYA",
  authDomain: "mangofirebase-17932.firebaseapp.com",
  projectId: "mangofirebase-17932",
  storageBucket: "mangofirebase-17932.firebasestorage.app",
  messagingSenderId: "588967962231",
  appId: "1:588967962231:web:b785089ae40c4ba2da4872",
  measurementId: "G-88JX6YQRN5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ФУНКЦИЯ ДЛЯ СОХРАНЕНИЯ ВАКАНСИИ
export async function saveVacancy(data) {
    try {
        await addDoc(collection(db, "vacancies"), {
            ...data,
            createdAt: new Date()
        });
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
}

// ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ВАКАНСИЙ
export async function loadVacancies() {
    const querySnapshot = await getDocs(collection(db, "vacancies"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}