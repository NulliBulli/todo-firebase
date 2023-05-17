import { useEffect, useState } from "react";
import "./App.css";
import moment from "moment";
import { editTodo, getTodo, removeTodo, uploadTodo } from "./firebase/util";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase/firebase";
import TodoInput from "./components/TodoInput";

function App() {
  const [inputState, setInputState] = useState({
    title: "",
    date: "",
    progress: 0,
    editMode: false,
  });
  const [todos, setTodos] = useState({});

  const [impressumOn, setImpressumOn] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "todos", "root"), (doc) => {
      if (!doc.metadata.hasPendingWrites) {
        return;
      }
      setTodos(doc.data());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      setTodos((await getTodo()).data());
    })();
  }, []);

  const todoInputCallback = (fieldName, inputFieldValue, id) => {
    setTodos((prev) => {
      return {
        todos: {
          ...prev.todos,
          [id]: {
            ...prev.todos[id],
            [fieldName]: inputFieldValue,
          },
        },
      };
    });
  };

  return (
    <>
      {impressumOn ? (
        <div className="font-bold m-5">
          Autoren: Noel Jungnickel, Dennis Schreiber
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-5">
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline m-2"
              type="text"
              placeholder="title"
              value={inputState.title}
              onChange={(e) => {
                setInputState((prev) => {
                  return { ...prev, title: e.target.value };
                });
              }}
            />
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline m-2"
              type="date"
              placeholder="date"
              value={inputState.date}
              onChange={(e) => {
                setInputState((prev) => {
                  return {
                    ...prev,
                    date: moment(new Date(e.target.value)).format("YYYY-MM-DD"),
                  };
                });
              }}
            />
            <input
              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline m-2"
              min="0"
              max="100"
              type="number"
              placeholder="progress"
              value={inputState.progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val < 0 || val > 100) return;
                setInputState((prev) => {
                  return { ...prev, progress: val };
                });
              }}
            />
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full m-1"
              onClick={async () => {
                const { title, date } = inputState;
                if (title.length === 0 || !moment(date).isValid()) return;
                await uploadTodo(inputState);
              }}
            >
              upload
            </button>
          </div>
          {todos.todos
            ? Object.keys(todos.todos)
                .sort()
                .map((id) => {
                  const { title, date, progress, editMode } = todos.todos[id];
                  return (
                    <div key={id} className="grid md:grid-cols-5">
                      {editMode ? (
                        <TodoInput
                          todoFieldName="title"
                          callback={todoInputCallback}
                          type="text"
                          value={title}
                          id={id}
                        />
                      ) : (
                        <div className="md:break-words break-all inline-block bg-gray-50 shadow rounded py-2 px-3 m-2">
                          {title}
                        </div>
                      )}
                      {editMode ? (
                        <TodoInput
                          todoFieldName="date"
                          callback={todoInputCallback}
                          type="date"
                          value={date}
                          id={id}
                        />
                      ) : (
                        <div className="inline-block bg-gray-50 shadow rounded py-2 px-3 m-2">
                          {date}
                        </div>
                      )}
                      {editMode ? (
                        <TodoInput
                          todoFieldName="progress"
                          callback={todoInputCallback}
                          type="number"
                          value={progress}
                          id={id}
                        />
                      ) : (
                        <div className="inline-block bg-gray-50 shadow rounded py-2 px-3 m-2">
                          {progress}
                        </div>
                      )}
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-1 h-12"
                        onClick={async () => {
                          if (editMode) {
                            const val = Number(progress);
                            if (
                              title.length === 0 ||
                              !moment(date).isValid() ||
                              val < 0 ||
                              val > 100
                            )
                              return;
                            await editTodo(id, todos.todos[id]);
                          }

                          setTodos((prev) => {
                            return {
                              todos: {
                                ...prev.todos,
                                [id]: {
                                  ...prev.todos[id],
                                  editMode: !prev.todos[id].editMode,
                                },
                              },
                            };
                          });
                        }}
                      >
                        {editMode ? "save" : "edit"}
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full m-1 h-12"
                        onClick={async () => {
                          await removeTodo(id);
                        }}
                      >
                        delete
                      </button>
                    </div>
                  );
                })
            : "loading..."}
        </>
      )}
      <div className="fixed inset-x-0 bottom-0 ">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full m-1"
          onClick={() => {
            setImpressumOn((prev) => !prev);
          }}
        >
          {impressumOn ? "back" : "impressum"}
        </button>
      </div>
    </>
  );
}

export default App;
