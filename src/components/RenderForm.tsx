import React, { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import FileUpload from "./FileUpload";
import { Task } from "../types/Task";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  StrikethroughIcon,
} from "lucide-react";

interface RenderFormProps {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  dueDate: string;
  setDueDate: React.Dispatch<React.SetStateAction<string>>;
  status: Task["status"];
  setStatus: React.Dispatch<React.SetStateAction<Task["status"]>>;
  attachments: File[];
  setAttachments: React.Dispatch<React.SetStateAction<File[]>>;
  handleSubmit: (e: React.FormEvent) => void;
  initialTask?: Task | null | undefined;
  onClose: () => void;
  taskId?: string;
}

const RenderForm: React.FC<RenderFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  dueDate,
  setDueDate,
  status,
  setStatus,
  attachments,
  setAttachments,
  handleSubmit,
  initialTask,
  onClose,
  taskId,
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmitWrapper = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (formRef.current) {
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );
  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto">
        <form
          ref={formRef}
          onSubmit={handleSubmitWrapper}
          className="space-y-6 p-6"
        >
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium border rounded-xl p-2 focus-visible:ring-0"
          />

          <div className="space-y-2 border rounded-xl p-2">
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none border-none p-0 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const textarea = document.getElementById(
                      "description"
                    ) as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selectedText = description.slice(start, end);
                    setDescription(
                      description.slice(0, start) +
                        `**${selectedText}**` +
                        description.slice(end)
                    );
                  }}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const textarea = document.getElementById(
                      "description"
                    ) as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selectedText = description.slice(start, end);
                    setDescription(
                      description.slice(0, start) +
                        `*${selectedText}*` +
                        description.slice(end)
                    );
                  }}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const textarea = document.getElementById(
                      "description"
                    ) as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const selectedText = description.slice(start, end);
                    setDescription(
                      description.slice(0, start) +
                        `~~${selectedText}~~` +
                        description.slice(end)
                    );
                  }}
                >
                  <StrikethroughIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setDescription(description + "\n• ")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setDescription(description + "\n1. ")}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-400">
                {description.length}/300 characters
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Task Category*
              </label>
              <div className="mt-2 flex gap-2 w-1/2 md:w-full">
                <Button
                  type="button"
                  variant={category === "Work" ? "default" : "outline"}
                  onClick={() => setCategory("Work")}
                  className="flex-1 rounded-full focus:bg-[#7B1984]"
                >
                  Work
                </Button>
                <Button
                  type="button"
                  variant={category === "Personal" ? "default" : "outline"}
                  onClick={() => setCategory("Personal")}
                  className="flex-1 rounded-full focus:bg-[#7B1984]"
                >
                  Personal
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Due on*
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-2 w-1/2 md:w-full rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Task Status*
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as Task["status"])}
              >
                <SelectTrigger className="mt-2 w-1/2 md:w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todo">To Do</SelectItem>
                  <SelectItem value="In-Progress">IN-PROGRESS</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Attachment
            </label>
            <FileUpload
              taskId={taskId}
              onFilesSelected={(files) => setAttachments(files)}
              existingFiles={attachments}
            />
          </div>
        </form>
      </div>

      <div className="border-t p-4 flex justify-end gap-2 bg-white sticky bottom-0 mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="rounded-full hover:border-red-500 "
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSubmitWrapper}
          className="rounded-full bg-[#7B1984] hover:bg-[#7B1984]"
          disabled={!title || !dueDate || !category || !status}
        >
          {initialTask ? "UPDATE" : "CREATE"}
        </Button>
      </div>
    </div>
  );
};

export default RenderForm;
