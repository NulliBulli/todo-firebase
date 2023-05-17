import { doc, updateDoc, arrayUnion, getDoc, setDoc, arrayRemove, writeBatch, deleteField } from "firebase/firestore";
import { db } from "./firebase";

export const uploadTodo = async (todo) => {
  const ref = doc(db, "todos", "root");
  const root = await getDoc(ref);

  if (!root.exists()){
    setDoc(doc(db, "todos", "root"), { todos: {} });
  }
  
  const id =
    new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

  await updateDoc(ref, {
    [`todos.${id}`]: {...todo, id, editMode: false}
  });
};

export const getTodo = async () => {
  const ref = doc(db, "todos", "root");

  return await getDoc(ref);
};

export const removeTodo = async (id) => {
  const ref = doc(db, "todos", "root");

  await updateDoc(ref, {
    [`todos.${id}`]: deleteField()
  });
};

export const editTodo = async (id, editedTodo) => {
  const ref = doc(db, "todos", "root");

  await updateDoc(ref, {[`todos.${id}`]: {...editedTodo, editMode: false}})
}