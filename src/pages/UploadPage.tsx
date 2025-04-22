
import React from 'react';
import NavBar from '@/components/NavBar';
import DocumentUpload from '@/components/DocumentUpload';
import QueueStatus from '@/components/QueueStatus';
import { Clock, FileCheck, FileWarning } from 'lucide-react';

const UploadPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload Document</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DocumentUpload />
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium flex items-center mb-2">
                  <FileCheck className="h-5 w-5 text-green-500 mr-2" />
                  Supported Formats
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF documents (.pdf)</li>
                  <li>• Microsoft Word (.doc, .docx)</li>
                  <li>• Plain text files (.txt)</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium flex items-center mb-2">
                  <FileWarning className="h-5 w-5 text-amber-500 mr-2" />
                  File Requirements
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Maximum file size: 10MB</li>
                  <li>• One document per upload</li>
                  <li>• No password-protected files</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <QueueStatus />
            
            <div className="mt-6 bg-white p-5 rounded-lg border">
              <h3 className="font-medium flex items-center mb-3">
                <Clock className="h-5 w-5 text-primary mr-2" />
                How It Works
              </h3>
              <ol className="text-sm text-gray-600 space-y-3">
                <li className="flex">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 shrink-0">1</span>
                  <span>Upload your document using the form</span>
                </li>
                <li className="flex">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 shrink-0">2</span>
                  <span>Your document joins the queue automatically</span>
                </li>
                <li className="flex">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 shrink-0">3</span>
                  <span>You'll receive a notification when it's printed</span>
                </li>
                <li className="flex">
                  <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2 shrink-0">4</span>
                  <span>Visit the printer to collect your document</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
