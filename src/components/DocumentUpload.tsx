
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { documentApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { FileUp, AlertCircle, Check } from 'lucide-react';

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to upload documents");
      navigate('/login');
      return;
    }
    
    try {
      setUploading(true);
      await documentApi.uploadDocument(file);
      setFile(null);
      navigate('/documents');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileUp className="mr-2 h-5 w-5 text-primary" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload your document to add it to the print queue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
          } transition-colors`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
          
          {file ? (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium text-lg">{file.name}</h3>
              <p className="text-muted-foreground text-sm">{getFileSize(file.size)}</p>
              <Button 
                variant="outline" 
                onClick={() => setFile(null)}
                className="mt-2"
              >
                Change File
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <FileUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium">Drag & drop your file here</h3>
              <p className="text-muted-foreground text-sm">or</p>
              <Button onClick={openFileSelector}>
                Browse files
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, DOC, DOCX, TXT
              </p>
            </div>
          )}
        </div>
        
        {!user && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              You need to <a href="/login" className="underline font-medium">sign in</a> or <a href="/register" className="underline font-medium">create an account</a> to upload documents
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || !user}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload to Print Queue'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload;
