// components/todos.tsx

import { createClient } from "@/utils/supabase/server";
import Todo from "./todo";
import AddTodo from "./add-todo";

export default async function Todos() {
  const supabase = createClient();

  const { data: todos, error } = await supabase.from("todos").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex flex-col">
        {/* Display incomplete todos */}
        {todos &&
          todos
            .filter((todo) => {
              return todo.is_complete == false;
            })
            .map((todo) => {
              return <Todo key={todo.id} todo={todo} />;
            })}
        
        {/* Display complete todos */}
        {todos &&
          todos
            .filter((todo) => {
              return todo.is_complete;
            })
            .map((todo) => {
              return <Todo key={todo.id} todo={todo} />;
            })}

        {/* Add a new todo */}
        <AddTodo />
      </div>
    </div>
  );
}
