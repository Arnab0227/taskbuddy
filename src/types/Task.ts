export interface Task {
    id: string;
    title: string;
    description: string;
    category:'All' | 'Work' | 'Personal';
    dueDate: 'All' | 'Today' | 'Tomorrow' | 'One Week' | 'One Month';
    createdAt: string;
    completed: boolean;
    attachments?: Array<{ name: string; url: string; uploadedAt: string }>;
    order?: number;
    status: 'Todo' | 'In-Progress' | 'Completed';
    statusChanges?: Array<{
      from: string;
      to: string;
      date: string;
    }>;
    updates?: Array<{
      date: string;
      field: string;
    }>;
    [key: string]: any;
  }
  
  