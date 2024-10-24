"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Todo } from "@/lib/interface";

// Add a new todo
export async function addTodo(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("todos")
    .insert([
      {
        user_id: user.id,
        task: formData.get("task") as string,
        is_complete: false,
        inserted_at: new Date(),
      },
    ])
    .select("id, task, is_complete"); // Only select necessary columns

  if (error) {
    throw new Error(error.message);
  }

  // Async revalidation for better performance
  revalidatePath("/");
}

// Edit an existing todo
export async function editTodo(todo: Todo) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("todos")
    .update({ task: todo.task })
    .eq("id", todo.id)
    .eq("user_id", user.id)
    .select("id, task"); // Only select the fields you need

  if (error) {
    throw new Error(error.message);
  }
}

// Delete a specific todo
export async function deleteTodo(id: number) {
  const supabase = createClient();

  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // Async revalidation
  revalidatePath("/");
}

// Delete completed todos in batch (fewer network calls)
export async function deleteCompletedTodos() {
  const supabase = createClient();

  const { error } = await supabase.from("todos").delete().eq("is_complete", true);

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate asynchronously
  revalidatePath("/");
}

// Delete all todos for the user
export async function deleteAllTodos() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase.from("todos").delete().eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate path asynchronously
  revalidatePath("/");
}

// Toggle todo completion status (use batching if possible)
export async function onCheckChange(todo: Todo) {
  const supabase = createClient();

  const { error } = await supabase
    .from("todos")
    .update({ is_complete: !todo.is_complete })
    .eq("id", todo.id)
    .select("id, is_complete");

  if (error) {
    throw new Error(error.message);
  }

  // Async revalidation to prevent blocking
  revalidatePath("/");
}
