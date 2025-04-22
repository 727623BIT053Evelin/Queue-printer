
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { documentApi, Document } from '@/services/api';
import { FileText, Clock, CheckCircle, XCircle, Loader2, AlertTriangle, DollarSign, Check } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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
      case 'awaiting_confirmation':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'skipped':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'paid':
        return <DollarSign className="h-5 w-5 text-green-500" />;
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
      case 'awaiting_confirmation':
        return 'Awaiting Confirmation';
      case 'skipped':
        return 'Skipped';
      case 'paid':
        return 'Paid & Queued';
      default:
        return 'Unknown';
    }
  };

  const handleConfirmPresence = async (documentId: string) => {
    try {
      await documentApi.confirmPresence(documentId);
      const docs = await documentApi.getUserDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to confirm presence:', error);
    }
  };

  const handlePay = async (documentId: string) => {
    try {
      await documentApi.payForDocument(documentId);
      const docs = await documentApi.getUserDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getTimeRemaining = (expiryTime: string) => {
    const expiry = new Date(expiryTime);
    const now = new Date();
    
    if (now > expiry) return "Expired";
    
    return formatDistanceToNow(expiry, { addSuffix: true });
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
              className={`document-card border rounded-lg p-4 transition-all ${
                doc.status === 'awaiting_confirmation' 
                  ? 'bg-amber-50 border-amber-200' 
                  : doc.status === 'completed' 
                  ? 'bg-green-50 border-green-200'
                  : doc.status === 'skipped'
                  ? 'bg-gray-50 border-gray-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{doc.name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                      <span>{doc.pages} {doc.pages === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{format(new Date(doc.createdAt), 'MMM d, h:mm a')}</span>
                      
                      {doc.printType && doc.colorType && (
                        <>
                          <span>•</span>
                          <span>
                            {doc.printType === 'single_side' ? 'Single-sided' : 'Double-sided'}, 
                            {doc.colorType === 'black_white' ? ' B&W' : ' Color'}
                          </span>
                        </>
                      )}
                      
                      {doc.paymentAmount && (
                        <>
                          <span>•</span>
                          <span className="font-medium">
                            {formatCurrency(doc.paymentAmount)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {doc.status === 'pending' && doc.queuePosition && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                      #{doc.queuePosition} in queue
                    </Badge>
                  )}
                  
                  {doc.status === 'paid' && doc.queuePosition && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                      #{doc.queuePosition} in queue
                    </Badge>
                  )}
                  
                  {doc.paymentStatus && (
                    <Badge 
                      variant={doc.paymentStatus === 'paid' ? 'default' : 'outline'} 
                      className={doc.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200'}
                    >
                      {doc.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </Badge>
                  )}
                  
                  <Badge variant="outline" className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200">
                    {getStatusIcon(doc.status)}
                    <span>{getStatusText(doc.status)}</span>
                  </Badge>
                </div>
              </div>
              
              {doc.status === 'awaiting_confirmation' && doc.confirmationExpiry && (
                <div className="mt-3 p-3 bg-amber-100 border border-amber-200 rounded">
                  <h4 className="font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mr-1" />
                    Action Required: Confirm Your Presence
                  </h4>
                  <p className="text-sm text-amber-800 mb-2">
                    Your document is ready to print! Please confirm your presence at the printer or pay online.
                    Time remaining: <span className="font-bold">{getTimeRemaining(doc.confirmationExpiry)}</span>
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleConfirmPresence(doc.id)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      I'm at the printer
                    </Button>
                    
                    {doc.paymentAmount && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePay(doc.id)}
                        className="border-amber-300 text-amber-800 hover:bg-amber-200"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Pay {formatCurrency(doc.paymentAmount)} now
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {doc.status === 'pending' && doc.queuePosition === 1 && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-700">
                  Your document is next in line for printing!
                </div>
              )}
              
              {doc.status === 'completed' && (
                <div className="mt-3 p-2 bg-green-50 border border-green-100 rounded text-sm text-green-700 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Your document has been printed and is ready for collection.
                </div>
              )}
              
              {doc.status === 'skipped' && (
                <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700 flex items-center">
                  <XCircle className="h-4 w-4 text-gray-500 mr-2" />
                  This document was skipped because confirmation time expired.
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
