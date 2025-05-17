
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Star } from "lucide-react";

const AdminReviews = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Reviews</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Total Reviews</p>
              <h2 className="text-3xl font-bold">0</h2>
              <p className="text-gray-400 text-sm mt-1">From database</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Average Rating</p>
              <h2 className="text-3xl font-bold">0</h2>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gray-500" />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Pending Reviews</p>
              <h2 className="text-3xl font-bold">0</h2>
              <p className="text-gray-400 text-sm mt-1">Requires moderation</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0e0e0e] border-gray-800 text-white">
            <CardContent className="p-6">
              <p className="text-gray-400 mb-2">Hidden Reviews</p>
              <h2 className="text-3xl font-bold">0</h2>
              <p className="text-gray-400 text-sm mt-1">Flagged for policy violations</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-[#0e0e0e] rounded-lg p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Rating Distribution</h2>
          <p className="text-gray-400 mb-6">Breakdown of ratings by star count</p>
          
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Based on 0 reviews</p>
          </div>
        </div>
        
        <div className="bg-[#0e0e0e] rounded-lg p-6 border border-gray-800">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">All Reviews</h2>
            <p className="text-gray-400">Manage and moderate user reviews</p>
          </div>
          
          <div className="flex justify-between mb-6 flex-wrap gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Search reviews..." 
                className="pl-10 bg-[#111111] border-gray-700 text-white"
              />
            </div>
            
            <div className="flex gap-4">
              <Select>
                <option value="all">All Statuses</option>
              </Select>
              
              <Select>
                <option value="all">All Ratings</option>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="border-b border-gray-800">
                  <TableHead className="text-left py-3 px-4 text-gray-400">Review</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Creator</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Rating</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Date</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Status</TableHead>
                  <TableHead className="text-left py-3 px-4 text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* No data to display initially */}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 text-center text-gray-500">
            No reviews found
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
