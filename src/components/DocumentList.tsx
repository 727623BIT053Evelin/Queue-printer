
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { documentApi, Document } from '@/services/api';
import { FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      
      try {
        const docs = await documentApi.getUserDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
    
    // Refresh documents periodically
    const intervalId = setInterval(fetchDocuments, 5000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'printing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In Queue';
      case 'printing':
        return 'Printing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 bg-muted rounded-md animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Please sign in</h3>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your documents
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
              <Button onClick={() => window.location.href = '/register'}>
                Create Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
          <CardDescription>
            Documents you've submitted for printing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't uploaded any documents for printing
            </p>
            <Button onClick={() => window.location.href = '/upload'}>
              Upload a document
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Documents</CardTitle>
        <CardDescription>
          Documents you've submitted for printing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="document-card border rounded-lg p-4 hover:bg-gray-50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{doc.name}</h3>
                    <div className="flex space-x-3 text-sm text-muted-foreground mt-1">
                      <span>{doc.pages} {doc.pages === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{format(new Date(doc.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {doc.status === 'pending' && doc.queuePosition && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      #{doc.queuePosition} in queue
                    </span>
                  )}
                  <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                    {getStatusIcon(doc.status)}
                    <span className="text-xs font-medium">{getStatusText(doc.status)}</span>
                  </div>
                </div>
              </div>
              
              {doc.status === 'pending' && doc.queuePosition === 1 && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
                  Your document is next in line for printing!
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentList;
