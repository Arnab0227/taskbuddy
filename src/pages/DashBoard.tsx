import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { List, LayoutGrid } from "lucide-react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { db, auth } from "../firebase/config";
import { Task } from "../types/Task";
import TaskItem from "./TaskItem";
import TaskForm from "../components/TaskForm";
import BatchActions from "../components/BatchActions";
import { IoIosSearch } from "react-icons/io";
import SkeletonLoader from "../components/SkeletonLoader";
import UserProfile from "../components/UserProfile";
import { TaskBoard } from "./TaskBoard";
import {
  filterTasks,
  CategoryFilter,
  DueDateFilter,
} from "../utils/filterHelpers";

const Dashboard: React.FC = () => {
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [view, setView] = useState<"list" | "board">("list");

  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>("tasks", async () => {
    const q = query(
      collection(db, `users/${auth.currentUser?.uid}/tasks`),
      orderBy("dueDate")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Task)
    );
  });

  const addTaskMutation = useMutation(
    (newTask: Omit<Task, "id">) =>
      addDoc(collection(db, `users/${auth.currentUser?.uid}/tasks`), newTask),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
      },
    }
  );

  const updateTaskMutation = useMutation(
    async (updatedTask: Task) => {
      const taskRef = doc(
        db,
        `users/${auth.currentUser?.uid}/tasks`,
        updatedTask.id
      );

      if (
        updatedTask.status !==
        tasks?.find((t) => t.id === updatedTask.id)?.status
      ) {
        const oldStatus = tasks?.find((t) => t.id === updatedTask.id)?.status;
        updatedTask.statusChanges = [
          ...(updatedTask.statusChanges || []),
          {
            from: oldStatus || "",
            to: updatedTask.status,
            date: new Date().toISOString(),
          },
        ];
      }

      const oldTask = tasks?.find((t) => t.id === updatedTask.id);
      if (oldTask) {
        const changedFields = Object.keys(updatedTask).filter(
          (key) =>
            key !== "id" &&
            key !== "statusChanges" &&
            key !== "updates" &&
            updatedTask[key] !== oldTask[key]
        );

        if (changedFields.length > 0) {
          updatedTask.updates = [
            ...(updatedTask.updates || []),
            ...changedFields.map((field) => ({
              field,
              date: new Date().toISOString(),
            })),
          ];
        }
      }

      await updateDoc(
        taskRef,
        Object.fromEntries(
          Object.entries(updatedTask).filter(([key]) => key !== "id")
        )
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
      },
    }
  );

  const deleteTaskMutation = useMutation(
    (taskId: string) =>
      deleteDoc(doc(db, `users/${auth.currentUser?.uid}/tasks`, taskId)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
      },
    }
  );

  const filteredTasks = tasks
    ? filterTasks(tasks, categoryFilter, dueDateFilter, searchQuery)
    : [];

  const handleTaskSelection = (taskId: string, isSelected: boolean) => {
    setSelectedTasks((prev) => {
      if (isSelected) {
        return [...prev, taskId];
      } else {
        return prev.filter((id) => id !== taskId);
      }
    });
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    const task = tasks?.find((task) => task.id === taskId);
    if (task) {
      const statusChange = {
        from: task.status,
        to: newStatus,
        date: new Date().toISOString(),
      };

      updateTaskMutation.mutate({
        ...task,
        status: newStatus,
        statusChanges: [...(task.statusChanges || []), statusChange],
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };
  const handleDeleteTasks = (taskIds: string[]) => {
    taskIds.forEach((taskId) => {
      deleteTaskMutation.mutate(taskId);
    });
    setSelectedTasks([]);
  };

  const handleSubmitTask = (taskData: Omit<Task, "id"> & { id?: string }) => {
    if (taskData.id) {
      updateTaskMutation.mutate(taskData as Task);
    } else {
      addTaskMutation.mutate(taskData);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <div>
      <div className="flex items-center justify-between bg-[#FAEEFC] px-2 h-14">
        <h1 className="text-xl ">TaskBuddy</h1>
        <UserProfile />
      </div>
      <div className="hidden md:flex items-center gap-2 px-4 py-2 border-b">
        <Button
          variant={view === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("list")}
          className="gap-2 bg-transparent hover:bg-transparent text-[#7B1984] hover:text-[#7B1984] focus:bg-transparent focus:text-[#7B1984] focus:underline"
        >
          <List className="h-4 w-4" />
          List
        </Button>
        <Button
          variant={view === "board" ? "default" : "ghost"}
          size="sm"
          onClick={() => setView("board")}
          className="gap-2 bg-transparent hover:bg-transparent text-[#7B1984] hover:text-[#7B1984] focus:bg-transparent focus:text-[#7B1984] focus:underline"
        >
          <LayoutGrid className="h-4 w-4" />
          Board
        </Button>
      </div>

      <div className="mb-4 flex justify-end items-center md:hidden">
        <button
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="bg-[#7B1984] text-white px-4 py-2 mt-3 mr-3 rounded-full"
        >
          Add Task
        </button>
      </div>

      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmitTask}
        initialTask={editingTask}
      />

      <div className="md:flex md:justify-between md:items-center md:px-3 md:py-4">
        <div className="mx-3 mb-4 md:mx-0 md:mb-0 md:flex md:items-center md:gap-2 md:flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Filter by:
          </label>
          <div className="flex space-x-3 items-center pt-2 md:pt-0 ">
            <Select
              onValueChange={(value: CategoryFilter) =>
                setCategoryFilter(value)
              }
            >
              <SelectTrigger className="w-28 rounded-full">
                <SelectValue placeholder="Category " />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value: DueDateFilter) => setDueDateFilter(value)}
            >
              <SelectTrigger className="w-28 rounded-full">
                <SelectValue placeholder="Due Date " />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="Tomorrow">Tomorrow</SelectItem>
                <SelectItem value="One Week">One Week</SelectItem>
                <SelectItem value="One Month">One Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="md:flex md:items-center md:gap-4">
          <div className="flex items-center border border-gray-400 px-3 py-2 mb-4 md:mb-0 mx-3 md:mx-0 rounded-full md:w-auto ">
            <IoIosSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none outline-none "
            />
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="bg-[#7B1984] text-white px-4 py-2 rounded-full w-full md:w-auto hidden md:block"
          >
            Add Task
          </button>
        </div>
      </div>
      {view === "list" ? (
        <div className="pt-4 grid grid-cols-1 gap-4 mx-3">
          <div className="hidden md:grid md:grid-cols-4 px-4 pt-3 font-medium text-sm border-t border-gray-200">
            <div>Task name</div>
            <div>Due on</div>
            <div>Task Status</div>
            <div>Task Category</div>
          </div>
          <TaskItem
            title="To Do"
            status="Todo"
            tasks={filteredTasks.filter((task) => task.status === "Todo")}
            onTaskSelect={handleTaskSelection}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            selectedTasks={selectedTasks}
            onSubmit={handleSubmitTask}
            onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
          />

          <TaskItem
            title="In Progress"
            status="In-Progress"
            tasks={filteredTasks.filter(
              (task) => task.status === "In-Progress"
            )}
            onTaskSelect={handleTaskSelection}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            selectedTasks={selectedTasks}
            onSubmit={handleSubmitTask}
            onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
          />

          <TaskItem
            title="Completed"
            status="Completed"
            tasks={filteredTasks.filter((task) => task.status === "Completed")}
            onTaskSelect={handleTaskSelection}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            selectedTasks={selectedTasks}
            onSubmit={handleSubmitTask}
            onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
          />
        </div>
      ) : (
        <div className="flex-grow ">
          <TaskBoard
            tasks={filteredTasks || []}
            onEditTask={handleEditTask}
            onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
          />
        </div>
      )}
      {selectedTasks.length > 0 && (
        <BatchActions
          selectedTasks={selectedTasks}
          onTaskSelect={handleTaskSelection}
          onStatusChange={handleStatusChange}
          onDeleteTasks={handleDeleteTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;
