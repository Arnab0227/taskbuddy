import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "react-query";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc, doc } from "firebase/firestore";
import { storage, db, auth } from "../firebase/config";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  taskId?: string;
  onFilesSelected: (files: File[]) => void;
  existingFiles: File[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  taskId = "",
  onFilesSelected,
  existingFiles,
}) => {
  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation(
    async (file: File) => {
      if (!taskId) return;

      const storageRef = ref(
        storage,
        `users/${auth.currentUser?.uid}/tasks/${taskId}/${file.name}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, `users/${auth.currentUser?.uid}/tasks`, taskId), {
        attachments: [...existingFiles, { name: file.name, url: downloadURL }],
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["task", taskId]);
      },
    }
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected([...existingFiles, ...acceptedFiles]);
      acceptedFiles.forEach((file) => {
        uploadFileMutation.mutate(file);
      });
    },
    [existingFiles, onFilesSelected, uploadFileMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
    },
  });

  const removeFile = (index: number) => {
    const newFiles = [...existingFiles];
    newFiles.splice(index, 1);
    onFilesSelected(newFiles);
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith("image/") || file.type === "application/pdf";
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-sm text-gray-600">Drop your files here...</p>
        ) : (
          <p className="text-sm text-gray-600">
            Drop your files here or{" "}
            <span className="text-[#7B1984]">browse</span>
          </p>
        )}
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-4">
          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-gray-200 h-[200px]"
              >
                {isImageFile(file) ? (
                  <div className="h-full relative">
                    {file.type === "application/pdf" ? (
                      <embed
                        src={URL.createObjectURL(file)}
                        type="application/pdf"
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-white hover:bg-red-500/20"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 relative">
                    <div className="text-center p-4">
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-600 truncate flex-1">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
