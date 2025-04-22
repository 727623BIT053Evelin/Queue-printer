
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { documentApi, PrintPrice } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { FileUp, AlertCircle, Check, DollarSign, Banknote, Printer } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [printType, setPrintType] = useState<'single_side' | 'double_side'>('single_side');
  const [colorType, setColorType] = useState<'black_white' | 'color'>('black_white');
  const [payNow, setPayNow] = useState(false);
  const [prices, setPrices] = useState<PrintPrice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Get print prices
    const fetchPrices = () => {
      const prices = documentApi.getPrintPrices();
      setPrices(prices);
    };
    fetchPrices();
  }, []);

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
      await documentApi.uploadDocument(file, printType, colorType, payNow);
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

  const calculatePrice = () => {
    if (!prices || !file) return 0;
    
    // Get random page count between 1-5 (in a real app, this would be calculated from the file)
    const pageCount = Math.floor(Math.random() * 5) + 1;
    
    let pricePerPage = 0;
    if (printType === 'single_side' && colorType === 'black_white') {
      pricePerPage = prices.single_side_bw;
    } else if (printType === 'double_side' && colorType === 'black_white') {
      pricePerPage = prices.double_side_bw;
    } else if (printType === 'single_side' && colorType === 'color') {
      pricePerPage = prices.single_side_color;
    } else {
      pricePerPage = prices.double_side_color;
    }
    
    return (pricePerPage * pageCount) / 100; // Convert cents to dollars
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
        
        {file && (
          <div className="mt-6 space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3 flex items-center">
                <Printer className="mr-2 h-5 w-5 text-primary" />
                Print Options
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Print Type</h4>
                  <RadioGroup 
                    defaultValue={printType} 
                    onValueChange={(value) => setPrintType(value as 'single_side' | 'double_side')}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single_side" id="single_side" />
                      <Label htmlFor="single_side">Single Side</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="double_side" id="double_side" />
                      <Label htmlFor="double_side">Double Side</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Color Options</h4>
                  <RadioGroup 
                    defaultValue={colorType} 
                    onValueChange={(value) => setColorType(value as 'black_white' | 'color')}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="black_white" id="black_white" />
                      <Label htmlFor="black_white">Black & White</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="color" id="color" />
                      <Label htmlFor="color">Color</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="pay-now" 
                        checked={payNow}
                        onCheckedChange={setPayNow}
                      />
                      <Label htmlFor="pay-now" className="font-medium flex items-center">
                        <Banknote className="mr-1 h-4 w-4" />
                        Pay now (skip confirmation)
                      </Label>
                    </div>
                    {prices && (
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Estimated price:</span>
                        <p className="font-bold text-primary text-lg">${calculatePrice().toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {payNow ? "Pay now to skip physical presence requirement and get your prints faster." : 
                    "If you don't pay now, you'll need to confirm your presence and pay when your turn comes."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
          {uploading ? 'Uploading...' : (payNow ? 'Pay and Upload' : 'Upload to Print Queue')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload;
