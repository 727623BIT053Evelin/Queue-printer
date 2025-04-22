
import React, { useRef, useState } from "react";
import { documentApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    try {
      // Multi-upload: loop through selectedFiles and upload each as a separate document
      for (const file of selectedFiles) {
        // For demo, pick defaults for printType and colorType; user can expand later
        await documentApi.uploadDocument(file, 'single_side', 'black_white', false);
      }
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      // Errors handled in api
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-gray-500 text-center py-8">
        Please log in to upload your documents.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Upload your documents</h2>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="mb-4 block"
      />
      {selectedFiles.length > 0 && (
        <ul className="mb-2 text-sm">
          {selectedFiles.map((file, idx) => (
            <li key={file.name + idx}>{file.name}</li>
          ))}
        </ul>
      )}
      <Button
        onClick={handleUpload}
        disabled={isUploading || !selectedFiles.length}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload
          </>
        )}
      </Button>
    </div>
  );
};

export default DocumentUpload;
