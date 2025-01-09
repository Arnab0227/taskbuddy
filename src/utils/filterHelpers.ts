import { Task } from "../types/Task";

export type CategoryFilter = Task["category"];
export type DueDateFilter = Task["dueDate"];

export const filterTasks = (
  tasks: Task[],
  categoryFilter: CategoryFilter,
  dueDateFilter: DueDateFilter,
  searchQuery: string
): Task[] => {
  const now = new Date();

  return tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);

    let isWithinDueDate = true;
    if (dueDateFilter === "Today") {
      isWithinDueDate = dueDate.toDateString() === now.toDateString();
    } else if (dueDateFilter === "Tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      isWithinDueDate = dueDate.toDateString() === tomorrow.toDateString();
    } else if (dueDateFilter === "One Week") {
      const oneWeekLater = new Date();
      oneWeekLater.setDate(now.getDate() + 7);
      isWithinDueDate = dueDate <= oneWeekLater;
    } else if (dueDateFilter === "One Month") {
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(now.getMonth() + 1);
      isWithinDueDate = dueDate <= oneMonthLater;
    }

    // Handle category filtering
    let isWithinCategory = true;
    if (
      categoryFilter &&
      (categoryFilter === "Work" || categoryFilter === "Personal")
    ) {
      isWithinCategory = task.category === categoryFilter;
    }

    // Handle search query filtering
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    return isWithinDueDate && isWithinCategory && matchesSearch;
  });
};
