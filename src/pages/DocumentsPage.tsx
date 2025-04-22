
import React from 'react';
import NavBar from '@/components/NavBar';
import DocumentList from '@/components/DocumentList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload } from 'lucide-react';

const DocumentsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <Link to="/upload">
            <Button className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </Link>
        </div>
        
        <DocumentList />
      </div>
    </div>
  );
};

export default DocumentsPage;
