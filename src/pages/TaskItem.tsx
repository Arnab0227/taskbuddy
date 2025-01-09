import { useState } from "react";
import { FaChevronUp, FaChevronDown, FaPlus } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { Task } from "../types/Task";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LuCalendarRange } from "react-icons/lu";
import { BsThreeDots } from "react-icons/bs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AiOutlineEnter } from "react-icons/ai";

interface TaskItemProps {
  title: string;
  status: Task["status"];
  tasks: Task[];
  onTaskSelect: (taskId: string, isSelected: boolean) => void;
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
  onEditTask: (task: Task) => void;
  selectedTasks: string[];
  onSubmit: (task: Omit<Task, "id"> & { id?: string }) => void;
  onDeleteTask: (taskId: string) => void;
}

const getBgColor = (status: Task["status"]) => {
  switch (status) {
    case "Todo":
      return "bg-[#FAC3FF]";
    case "In-Progress":
      return "bg-[#85D9F1]";
    case "Completed":
      return "bg-[#CEFFCC]";
    default:
      return "bg-gray-100";
  }
};

const getArrowColor = (status: Task["status"]) => {
  switch (status) {
    case "Todo":
      return "text-[#3E0344]";
    case "In-Progress":
      return "text-[#055167]";
    case "Completed":
      return "text-[#0D7A0A]";
    default:
      return "text-gray-100";
  }
};

function TaskItem({
  title,
  status,
  tasks,
  onTaskSelect,
  onEditTask,
  selectedTasks,
  onSubmit,
  onDeleteTask,
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: new Date(),
    status: "Todo",
    category: "",
  });
  const filteredTasks = tasks.filter((task) => task.status === status);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleAddTask = () => {
    onSubmit({
      title: newTask.title,
      description: "",
      category: newTask.category,
      dueDate: newTask.dueDate.toISOString(),
      status: newTask.status,
      completed: newTask.status === "Completed",
      createdAt: new Date().toISOString(),
      attachments: [],
    });
    setNewTask({
      title: "",
      dueDate: new Date(),
      status: "Todo",
      category: "",
    });
    setIsAddingTask(false);
  };

  return (
    <div className="rounded-lg overflow-hidden">
      <div
        className={`px-4 py-4 flex items-center justify-between ${getBgColor(
          status
        )}`}
        onClick={toggleExpand}
      >
        <h2 className="text-xl">
          {title} ({filteredTasks.length})
        </h2>
        <button
          type="button"
          className={`text-lg focus:outline-none ${getArrowColor(status)}`}
          aria-label={isExpanded ? "Collapse tasks" : "Expand tasks"}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      {isExpanded && (
        <div className="bg-gray-100">
          {status === "Todo" && (
            <div className="hidden md:block md:px-4 md:py-2 md:border-b md:border-gray-200">
              {!isAddingTask ? (
                <Button
                  onClick={() => setIsAddingTask(true)}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <FaPlus className="mr-2 text-[#7B1984]" /> Add Task
                </Button>
              ) : (
                <div className="grid grid-cols-4 gap-2 items-center">
                  <Input
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="border-0 bg-transparent focus:outline-none h-8"
                    required
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="w-28 h-8 rounded-full justify-start border bg-transparent text-black hover:bg-transparent hover:shadow-md">
                        <LuCalendarRange /> Add Date
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newTask.dueDate}
                        onSelect={(date) =>
                          date && setNewTask({ ...newTask, dueDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="w-8 h-8 rounded-full bg-transparent text-black border hover:bg-transparent hover:shadow-md">
                        <FaPlus />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Select
                        onValueChange={(value) =>
                          setNewTask({
                            ...newTask,
                            status: value as Task["status"],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="choose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Todo">Todo</SelectItem>
                          <SelectItem value="In-Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="w-8 h-8 rounded-full bg-transparent text-black border hover:bg-transparent hover:shadow-md">
                        <FaPlus />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Select
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="choose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
                        </SelectContent>
                      </Select>
                    </PopoverContent>
                  </Popover>
                  <div className="flex justify-end items-center space-x-2">
                    <Button
                      onClick={handleAddTask}
                      className="h-7 rounded-full bg-[#7B1984] hover:bg-[#7B1984]"
                    >
                      ADD <AiOutlineEnter />
                    </Button>

                    <Button
                      onClick={() => setIsAddingTask(false)}
                      className="border-none bg-transparent text-black font-semibold text-xs hover:bg-transparent"
                    >
                      CANCEL
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex md:grid md:grid-cols-4 items-center gap-2 px-4 py-4 border-b border-gray-300 last:border-0 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2 md:col-span-1">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => onTaskSelect(task.id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-purple-500"
                  aria-label={`Select task: ${task.title}`}
                />
                <IoIosCheckmarkCircle
                  className={`text-2xl ${
                    task.status === "Completed"
                      ? "text-[#1B8D17]"
                      : "text-gray-400"
                  }`}
                />

                <span
                  className={`flex-grow truncate text-md cursor-pointer ${
                    task.completed ? "line-through" : ""
                  }`}
                  onClick={() => onEditTask(task)}
                >
                  {task.title}
                </span>
              </div>
              <div className="hidden md:block">
                {task.dueDate
                  ? (() => {
                      const date = new Date(task.dueDate);
                      const day = date.getDate().toString().padStart(2, "0");
                      const month = date.toLocaleString("en-GB", {
                        month: "short",
                      });
                      const year = date.getFullYear();
                      return `${day} ${month}, ${year}`;
                    })()
                  : "No date"}
              </div>
              <div className="hidden md:border md:w-28 md:flex md:justify-center md:rounded-lg md:bg-gray-300">
                {task.status}
              </div>
              <div className="hidden md:flex justify-between items-center">
                <span>{task.category}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                    >
                      <BsThreeDots className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskItem;
