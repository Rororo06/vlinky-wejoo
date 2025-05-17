
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

const AdminRevenue = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Revenue</h1>
          <div className="flex gap-4">
            <Button variant="outline" className="border-gray-700 bg-[#111111] text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Apr 10, 2025 - May 10, 2025
            </Button>
            <Button variant="outline" className="border-gray-700 bg-[#111111] text-white">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <p className="text-gray-400 mb-6">Track and manage platform revenue and creator earnings.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Total Revenue</p>
              <h2 className="text-3xl font-bold">$0.00</h2>
              <p className="text-green-500 text-sm mt-1">+18.2% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Platform Fee</p>
              <h2 className="text-3xl font-bold">$0.00</h2>
              <p className="text-gray-400 text-sm mt-1">30% of total revenue</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Creator Payouts</p>
              <h2 className="text-3xl font-bold">$0.00</h2>
              <p className="text-gray-400 text-sm mt-1">70% of total revenue</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Pending Payouts</p>
              <h2 className="text-3xl font-bold">$0.00</h2>
              <p className="text-gray-400 text-sm mt-1">To be processed on May 1</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-[#0e0e0e] rounded-lg border border-gray-800 mb-6">
          <Tabs defaultValue="overview">
            <TabsList className="bg-[#111111] border-b border-gray-800 w-full justify-start rounded-b-none h-12 px-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#0e0e0e] data-[state=active]:text-white text-gray-400">
                Overview
              </TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-[#0e0e0e] data-[state=active]:text-white text-gray-400">
                Transactions
              </TabsTrigger>
              <TabsTrigger value="payouts" className="data-[state=active]:bg-[#0e0e0e] data-[state=active]:text-white text-gray-400">
                Payouts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">Revenue Overview</h3>
              <p className="text-gray-400 mb-6">Monthly revenue for the current year</p>
              
              <div className="h-64 w-full border-t border-dashed border-gray-800 flex items-center justify-center">
                <p className="text-gray-500">No revenue data available</p>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No transactions available</p>
              </div>
            </TabsContent>
            
            <TabsContent value="payouts" className="p-6">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No payouts available</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;
