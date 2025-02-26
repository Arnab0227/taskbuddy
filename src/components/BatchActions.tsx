import React from "react";
import { useMutation, useQueryClient } from "react-query";
import {
  collection,
  query,
  where,
  getDocs, 
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { Task } from "../types/Task";
import { RxCross2 } from "react-icons/rx";
import { BiSelectMultiple } from "react-icons/bi";
import { GrCheckboxSelected } from "react-icons/gr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface BatchActionsProps {
  selectedTasks: string[];
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
  onTaskSelect: (taskId: string, isSelected: boolean) => void;
  onDeleteTasks: (taskIds: string[]) => void;
}

const BatchActions: React.FC<BatchActionsProps> = ({
  selectedTasks,
  onTaskSelect,
  onStatusChange,
  onDeleteTasks,
}) => {
  const queryClient = useQueryClient();

  const batchDeleteMutation = useMutation(
    async () => {
      const batch = writeBatch(db);
      const tasksRef = collection(db, `users/${auth.currentUser?.uid}/tasks`);
      const q = query(tasksRef, where("__name__", "in", selectedTasks));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
        onDeleteTasks(selectedTasks);
      },
    }
  );

  const batchUpdateStatusMutation = useMutation(
    async (newStatus: Task["status"]) => {
      const batch = writeBatch(db);
      const tasksRef = collection(db, `users/${auth.currentUser?.uid}/tasks`);
      const q = query(tasksRef, where("__name__", "in", selectedTasks));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          status: newStatus,
          completed: newStatus === "Completed", 
        })
      });
      await batch.commit();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("tasks");
        selectedTasks.forEach((taskId) => onTaskSelect(taskId, false));
      },
    }
  );

  const handleStatusChange = (newStatus: Task["status"]) => {
    batchUpdateStatusMutation.mutate(newStatus);
    selectedTasks.forEach((taskId) => onStatusChange(taskId, newStatus));
  };

  const handleDelete = () => {
    batchDeleteMutation.mutate();
  };

  const handleUnselectAll = () => {
    selectedTasks.forEach((taskId) => onTaskSelect(taskId, false));
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 rounded-2xl bg-gray-900 text-white py-4 px-4 flex items-center justify-between">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-white rounded-2xl px-2 py-2">
            <span className="text-sm mr-2">
              {selectedTasks.length}{" "}
              {selectedTasks.length === 1 ? "Task" : "Tasks"} Selected
            </span>
            <button
              onClick={handleUnselectAll}
              className="text-white hover:text-red-500 transition-colors text-lg"
              aria-label="Clear Selection"
            >
              <RxCross2 />
            </button>
          </div>
          <div className="text-white hover:text-red-500 transition-colors" onClick={handleUnselectAll}>
            {selectedTasks.length >= 2 ? (
              <BiSelectMultiple className="w-5 h-5" />
            ) : (
              <GrCheckboxSelected className="w-5 h-5" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w bg-transparent rounded-full border-white text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white">
              <SelectItem value="Todo">To Do</SelectItem>
              <SelectItem value="In-Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-red-500 text-red-500 bg-red-500/[0.2] rounded-full"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BatchActions;
