
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import QueueStatus from '@/components/QueueStatus';
import { Printer, Clock, Upload, List, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 hero-gradient">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                No More Waiting in Line for Printing
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Upload your documents from anywhere, track your position in the queue, and get notified when your print job is complete.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/upload">
                  <Button size="lg" className="w-full sm:w-auto">
                    Upload Document
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/queue">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Check Queue Status
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/10 rounded-full"></div>
                <div className="bg-white p-6 rounded-xl shadow-lg z-10 relative">
                  <div className="w-20 h-20 mx-auto mb-4 logo-gradient rounded-full flex items-center justify-center">
                    <Printer className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3">PrintQueue</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Upload className="h-5 w-5 text-primary mr-3" />
                      <span className="text-sm">Upload documents remotely</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <List className="h-5 w-5 text-primary mr-3" />
                      <span className="text-sm">See your position in queue</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-primary mr-3" />
                      <span className="text-sm">Get accurate wait times</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Your Document</h3>
              <p className="text-gray-600">
                Upload your document from your phone or laptop. No need to physically be at the printer.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <List className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Check Your Position</h3>
              <p className="text-gray-600">
                See your position in the queue and get an accurate estimate of your wait time.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Printer className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Notified</h3>
              <p className="text-gray-600">
                Receive a notification when your document is printed and ready for pickup.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Current Queue Status */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-center mb-8">Current Queue Status</h2>
          <QueueStatus />
        </div>
      </section>
    </div>
  );
};

export default Index;
