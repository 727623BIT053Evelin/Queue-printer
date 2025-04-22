import React, { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import DocumentList from '@/components/DocumentList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Upload, Bell, X } from 'lucide-react';
import { documentApi, Document } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import QueueStatus from '@/components/QueueStatus';

const DocumentsPage = () => {
  const [readyDocuments, setReadyDocuments] = useState<Document[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkReadyDocuments = async () => {
      if (!user) return;
      
      try {
        const docs = await documentApi.getUserDocuments();
        const completedDocs = docs.filter(doc => 
          doc.status === 'completed' && 
          new Date(doc.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
        );
        
        if (completedDocs.length > 0) {
          setReadyDocuments(completedDocs);
          setShowAlert(true);
        }
      } catch (error) {
        console.error('Failed to check for ready documents:', error);
      }
    };
    
    checkReadyDocuments();
    
    // Check periodically
    const intervalId = setInterval(checkReadyDocuments, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {showAlert && readyDocuments.length > 0 && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Bell className="h-4 w-4 text-green-500" />
            <div className="flex-1">
              <AlertTitle className="text-green-800">Documents Ready for Collection</AlertTitle>
              <AlertDescription className="text-green-700">
                {readyDocuments.length === 1 
                  ? `Your document "${readyDocuments[0].name}" is ready for collection.` 
                  : `You have ${readyDocuments.length} documents ready for collection.`
                }
              </AlertDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setShowAlert(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <Link to="/upload">
            <Button className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
          </Link>
        </div>
        
        <div className="mb-8">
          <QueueStatus />
        </div>
        
        <DocumentList />
      </div>
    </div>
  );
};

export default DocumentsPage;
