import { Task } from "../types/Task";
import { Button } from "@/components/ui/button";
import { BsThreeDots } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const getHeaderColor = (status: Task["status"]) => {
  switch (status) {
    case "Todo":
      return "bg-[#FAC3FF]";
    case "In-Progress":
      return "bg-[#85D9F1]";
    case "Completed":
      return "bg-[#CEFFCC]";
    default:
      return "bg-gray-200";
  }
};

export function TaskBoard({ tasks, onEditTask, onDeleteTask }: TaskBoardProps) {
  const columns = [
    { title: "TODO", status: "Todo" },
    { title: "IN-PROGRESS", status: "In-Progress" },
    { title: "COMPLETED", status: "Completed" },
  ];

  return (
    <div className="hidden md:grid md:grid-cols-3 gap-6 p-6 h-[calc(100vh-200px)] lg:w-3/4 mb-10">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.status
        );

        return (
          <div
            key={column.status}
            className="rounded-xl bg-gray-200 flex flex-col "
          >
            <div className="p-4 rounded-t-xl sticky top-0 bg-gray-200 z-10">
              <div
                className={`font-semibold border rounded-lg py-1 flex justify-center items-center w-32 ${getHeaderColor(
                  column.status as Task["status"]
                )}`}
              >
                {column.title}
              </div>
            </div>
            <div className="p-4 space-y-4 flex-grow overflow-y-auto h-[calc(90vh-300px)]">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg p-4 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h4
                      className="font-medium"
                      onClick={() => onEditTask(task)}
                    >
                      {task.title}
                    </h4>
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
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{task.category}</span>
                    <span>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "No date"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
