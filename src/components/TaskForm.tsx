import { useState, useEffect } from "react";
import { Task } from "../types/Task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RenderForm from "./RenderForm";
import { format } from "date-fns";

interface TaskFormProps {
  onSubmit: (task: Omit<Task, "id"> & { id?: string }) => void;
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null | undefined;
}

function TaskForm({ onSubmit, isOpen, onClose, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<Task["status"]>("Todo");
  const [attachments, setAttachments] = useState<File[]>([]);
  const taskId = initialTask?.id ?? "";

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setCategory(initialTask.category);
      setDueDate(initialTask.dueDate);
      setStatus(initialTask.status);
    } else {
      setTitle("");
      setDescription("");
      setCategory("");
      setDueDate("");
      setStatus("Todo");
      setAttachments([]);
    }
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate.trim() || !status || !category.trim()) return;

    const taskData: Omit<Task, "id"> & { id?: string } = {
      title,
      description,
      category,
      dueDate,
      status,
      completed: status === "Completed",
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      attachments: [],
    };

    if (initialTask?.id) {
      taskData.id = initialTask.id;
    }

    onSubmit(taskData);
    onClose();
  };

  const renderActivityTimeline = () => {
    if (!initialTask) return null;

    const events = [
      {
        action: "Created task",
        date: initialTask.createdAt,
        type: "creation",
      },
      ...(initialTask.statusChanges || []).map((change) => ({
        action: `Changed status from ${change.from} to ${change.to}`,
        date: change.date,
        type: "status",
      })),
      ...(initialTask.attachments || []).map((attachment) => ({
        action: `Uploaded file: ${attachment.name}`,
        date: attachment.uploadedAt,
        type: "file",
      })),
      ...(initialTask.updates || []).map((update) => ({
        action: `Updated task: ${update.field}`,
        date: update.date,
        type: "update",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="space-y-4 h-full overflow-y-auto">
        {events.map((event, index) => (
          <div key={index} className="flex items-start gap-3 py-2">
            <div
              className={`mt-1 h-2 w-2 rounded-full ${
                event.type === "creation"
                  ? "bg-green-500"
                  : event.type === "status"
                  ? "bg-blue-500"
                  : event.type === "update"
                  ? "bg-orange-500"
                  : "bg-purple-500"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {event.action}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[920px] h-[95vh] md:h-[80vh] rounded-xl md:mt-0  p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-2 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {initialTask ? "" : "Create Task"}
          </DialogTitle>
        </DialogHeader>

        {initialTask ? (
          <>
            {/* Mobile View */}
            <div className="block md:hidden ">
              <Tabs defaultValue="details" className="h-full">
                <TabsList className="w-full grid grid-cols-2 bg-transparent p-0 h-12">
                  <TabsTrigger
                    value="details"
                    className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    DETAILS
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="rounded-full data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    ACTIVITY
                  </TabsTrigger>
                </TabsList>

                <div className="">
                  <TabsContent
                    value="details"
                    className="h-[80vh] m-0 data-[state=active]:flex data-[state=active]:flex-col"
                  >
                    <RenderForm
                      title={title}
                      setTitle={setTitle}
                      description={description}
                      setDescription={setDescription}
                      category={category}
                      setCategory={setCategory}
                      dueDate={dueDate}
                      setDueDate={setDueDate}
                      status={status}
                      setStatus={setStatus}
                      attachments={attachments}
                      setAttachments={setAttachments}
                      handleSubmit={handleSubmit}
                      initialTask={initialTask}
                      onClose={onClose}
                      taskId={taskId}
                    />
                  </TabsContent>

                  <TabsContent
                    value="activity"
                    className="h-[80vh] m-0 p-5 data-[state=active]:block  bg-white"
                  >
                    {renderActivityTimeline()}
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Desktop View */}
            <div className="hidden md:grid md:grid-cols-3 h-[calc(100%-4rem)]">
              <div className="col-span-2 border-r">
                <RenderForm
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  category={category}
                  setCategory={setCategory}
                  dueDate={dueDate}
                  setDueDate={setDueDate}
                  status={status}
                  setStatus={setStatus}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  handleSubmit={handleSubmit}
                  initialTask={initialTask}
                  onClose={onClose}
                  taskId={taskId}
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Activity</h3>
                <div className="overflow-y-auto">
                  {renderActivityTimeline()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            <RenderForm
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              category={category}
              setCategory={setCategory}
              dueDate={dueDate}
              setDueDate={setDueDate}
              status={status}
              setStatus={setStatus}
              attachments={attachments}
              setAttachments={setAttachments}
              handleSubmit={handleSubmit}
              initialTask={initialTask}
              onClose={onClose}
              taskId={taskId}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TaskForm;
