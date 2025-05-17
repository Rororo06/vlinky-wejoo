import React, { useState } from 'react';
import { Search, Plus, Calendar, RefreshCw, Download, ChevronDown, Bell } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("all-notifications");
  
  // Notification settings state
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [senderEmail, setSenderEmail] = useState("notifications@creator-platform.com");
  const [emailFooterText, setEmailFooterText] = useState("© 2023 Creator Platform. All rights reserved.");
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);
  const [dailyLimit, setDailyLimit] = useState("5");
  const [quietHoursStart, setQuietHoursStart] = useState("10:00 PM");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00 AM");

  const handleSaveSettings = () => {
    toast.success("Notification settings saved successfully");
  };

  const handleCreateNotification = () => {
    toast.success("New notification created");
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400">Manage system notifications and user communications.</p>
          </div>
          <Button 
            className="flex items-center gap-2" 
            onClick={handleCreateNotification}
          >
            <Plus className="h-4 w-4" /> Create Notification
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-[#0e0e0e] border border-gray-800 rounded-md">
            <TabsTrigger value="all-notifications" className="data-[state=active]:bg-gray-800">All Notifications</TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-gray-800">Templates</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-800">Settings</TabsTrigger>
          </TabsList>
          
          {/* All Notifications Tab */}
          <TabsContent value="all-notifications" className="mt-4">
            <div className="bg-[#0e0e0e] border border-gray-800 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Notification Management</h2>
                <p className="text-gray-400">View and manage system notifications</p>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Search notifications..." 
                    className="pl-10 bg-[#111111] border-gray-700 text-white w-full"
                  />
                </div>
                <Select defaultValue="all-types">
                  <SelectTrigger className="w-44 bg-[#111111] border-gray-700 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-gray-700 text-white">
                    <SelectItem value="all-types">All Types</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-800">
                      <TableHead className="text-left py-3 px-4 text-gray-400">Title</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Type</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Recipients</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Created</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Status</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No notifications found
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-4">
            <div className="bg-[#0e0e0e] border border-gray-800 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Notification Templates</h2>
                <p className="text-gray-400">Manage reusable notification templates</p>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-800">
                      <TableHead className="text-left py-3 px-4 text-gray-400">Template Name</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Type</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Description</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Last Modified</TableHead>
                      <TableHead className="text-left py-3 px-4 text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        No templates found
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-4">
            <div className="bg-[#0e0e0e] border border-gray-800 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Notification Settings</h2>
                <p className="text-gray-400">Configure system-wide notification settings</p>
              </div>
              
              <div className="space-y-8">
                {/* Email Notifications Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Enable Email Notifications</h4>
                      <p className="text-xs text-gray-400">Send notifications via email to users.</p>
                    </div>
                    <Switch 
                      checked={enableEmailNotifications} 
                      onCheckedChange={setEnableEmailNotifications}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sender-email" className="block text-sm font-medium text-gray-300 mb-1">
                      Default Sender Email
                    </label>
                    <Input 
                      id="sender-email" 
                      value={senderEmail} 
                      onChange={(e) => setSenderEmail(e.target.value)} 
                      className="bg-[#111111] border-gray-700 text-white"
                      placeholder="notifications@example.com"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email address used as the sender for all notifications.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="email-footer" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Footer Text
                    </label>
                    <Textarea 
                      id="email-footer" 
                      value={emailFooterText} 
                      onChange={(e) => setEmailFooterText(e.target.value)} 
                      className="bg-[#111111] border-gray-700 text-white min-h-[100px]"
                      placeholder="© 2023 Your Company. All rights reserved."
                    />
                    <p className="text-xs text-gray-400 mt-1">Text that appears at the bottom of all email notifications.</p>
                  </div>
                </div>
                
                {/* Push Notifications Section */}
                <div className="space-y-4 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-bold text-white">Push Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">Enable Push Notifications</h4>
                      <p className="text-xs text-gray-400">Send notifications to mobile and desktop devices.</p>
                    </div>
                    <Switch 
                      checked={enablePushNotifications} 
                      onCheckedChange={setEnablePushNotifications}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Default Push Icon
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#111111] rounded-md flex items-center justify-center border border-gray-700">
                        <Bell className="h-6 w-6 text-white" />
                      </div>
                      <Button variant="outline" className="bg-[#111111] border-gray-700 text-white hover:bg-gray-800">
                        Change Icon
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Notification Limits Section */}
                <div className="space-y-4 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-bold text-white">Notification Limits</h3>
                  
                  <div>
                    <label htmlFor="daily-limit" className="block text-sm font-medium text-gray-300 mb-1">
                      Daily Notification Limit
                    </label>
                    <Input 
                      id="daily-limit" 
                      type="number"
                      value={dailyLimit} 
                      onChange={(e) => setDailyLimit(e.target.value)} 
                      className="bg-[#111111] border-gray-700 text-white w-full max-w-xs"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maximum number of notifications sent to a user per day.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Quiet Hours
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="time"
                        value={quietHoursStart.replace(" PM", "").replace(" AM", "")} 
                        onChange={(e) => {
                          const time = e.target.value;
                          const hour = parseInt(time.split(":")[0]);
                          const period = hour >= 12 ? "PM" : "AM";
                          const displayHour = hour > 12 ? hour - 12 : hour;
                          const minutes = time.split(":")[1];
                          setQuietHoursStart(`${displayHour}:${minutes} ${period}`);
                        }}
                        className="bg-[#111111] border-gray-700 text-white w-32"
                      />
                      <span className="text-gray-400">to</span>
                      <Input 
                        type="time" 
                        value={quietHoursEnd.replace(" PM", "").replace(" AM", "")}
                        onChange={(e) => {
                          const time = e.target.value;
                          const hour = parseInt(time.split(":")[0]);
                          const period = hour >= 12 ? "PM" : "AM";
                          const displayHour = hour > 12 ? hour - 12 : hour;
                          const minutes = time.split(":")[1];
                          setQuietHoursEnd(`${displayHour}:${minutes} ${period}`);
                        }}
                        className="bg-[#111111] border-gray-700 text-white w-32"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Time period when notifications are not sent (user's local time).</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
