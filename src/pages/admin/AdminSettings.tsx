
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");

  // General settings state
  const [platformName, setPlatformName] = useState("Creator Platform");
  const [platformURL, setPlatformURL] = useState("https://creator-platform.com");
  const [supportEmail, setSupportEmail] = useState("support@creator-platform.com");
  const [platformDescription, setPlatformDescription] = useState("A platform connecting creators with their audience through personalized video content.");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [platformFee, setPlatformFee] = useState("20");
  const [minimumPayout, setMinimumPayout] = useState("50");
  const [payoutSchedule, setPayoutSchedule] = useState("monthly");
  const [autoApprove, setAutoApprove] = useState(false);

  // Security settings state
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);
  const [strongPassword, setStrongPassword] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [accountLockout, setAccountLockout] = useState("30");

  // Sample API keys
  const [apiKeys, setApiKeys] = useState([]);

  // Sample team members
  const [teamMembers, setTeamMembers] = useState([]);

  const handleSaveChanges = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-6">Manage platform settings and configurations.</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-[#0e0e0e] rounded-lg border border-gray-800">
          <TabsList className="w-full flex rounded-none p-0 bg-transparent border-b border-gray-800">
            <TabsTrigger 
              value="general" 
              className="flex-1 rounded-none py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary text-gray-400 data-[state=active]:text-white"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex-1 rounded-none py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary text-gray-400 data-[state=active]:text-white"
            >
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="api-keys" 
              className="flex-1 rounded-none py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary text-gray-400 data-[state=active]:text-white"
            >
              API Keys
            </TabsTrigger>
            <TabsTrigger 
              value="team-members" 
              className="flex-1 rounded-none py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary text-gray-400 data-[state=active]:text-white"
            >
              Team Members
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="p-6">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Platform Settings</h2>
                <p className="text-gray-400 mb-6">Configure general platform settings.</p>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="platform-name" className="block text-sm font-medium text-gray-300 mb-1">
                      Platform Name
                    </label>
                    <Input 
                      id="platform-name" 
                      value={platformName} 
                      onChange={(e) => setPlatformName(e.target.value)} 
                      className="bg-[#111111] border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">The name of your platform as it appears to users.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="platform-url" className="block text-sm font-medium text-gray-300 mb-1">
                      Platform URL
                    </label>
                    <Input 
                      id="platform-url" 
                      value={platformURL} 
                      onChange={(e) => setPlatformURL(e.target.value)} 
                      className="bg-[#111111] border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">The primary URL for your platform.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="support-email" className="block text-sm font-medium text-gray-300 mb-1">
                      Support Email
                    </label>
                    <Input 
                      id="support-email" 
                      value={supportEmail} 
                      onChange={(e) => setSupportEmail(e.target.value)} 
                      className="bg-[#111111] border-gray-700 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email address displayed for customer support inquiries.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="platform-description" className="block text-sm font-medium text-gray-300 mb-1">
                      Platform Description
                    </label>
                    <Textarea 
                      id="platform-description" 
                      value={platformDescription} 
                      onChange={(e) => setPlatformDescription(e.target.value)} 
                      className="bg-[#111111] border-gray-700 text-white min-h-[100px]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Brief description of your platform for SEO and marketing.</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Maintenance Mode</h4>
                      <p className="text-xs text-gray-400">Put the platform in maintenance mode for all users.</p>
                    </div>
                    <Switch 
                      checked={maintenanceMode} 
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>
                </div>

                <Button className="mt-6" onClick={() => handleSaveChanges("General platform")}>
                  Save Changes
                </Button>
              </div>
              
              <div className="pt-6 border-t border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-2">Creator Settings</h2>
                <p className="text-gray-400 mb-6">Configure settings for creators on the platform</p>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="platform-fee" className="block text-sm font-medium text-gray-300 mb-1">
                      Platform Fee (%)
                    </label>
                    <div className="relative">
                      <Input 
                        id="platform-fee" 
                        type="number"
                        value={platformFee}
                        onChange={(e) => setPlatformFee(e.target.value)} 
                        className="bg-[#111111] border-gray-700 text-white pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Percentage fee taken from creator earnings.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="minimum-payout" className="block text-sm font-medium text-gray-300 mb-1">
                      Minimum Payout Threshold ($)
                    </label>
                    <div className="relative">
                      <Input 
                        id="minimum-payout" 
                        type="number"
                        value={minimumPayout}
                        onChange={(e) => setMinimumPayout(e.target.value)} 
                        className="bg-[#111111] border-gray-700 text-white pl-8"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-400">$</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Minimum amount required for creator payouts.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="payout-schedule" className="block text-sm font-medium text-gray-300 mb-1">
                      Payout Schedule
                    </label>
                    <Select value={payoutSchedule} onValueChange={setPayoutSchedule}>
                      <SelectTrigger className="bg-[#111111] border-gray-700 text-white">
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-gray-700 text-white">
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 mt-1">How often creator payouts are processed.</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Auto-approve Creators</h4>
                      <p className="text-xs text-gray-400">Automatically approve new creator applications.</p>
                    </div>
                    <Switch 
                      checked={autoApprove} 
                      onCheckedChange={setAutoApprove}
                    />
                  </div>
                </div>

                <Button className="mt-6" onClick={() => handleSaveChanges("Creator")}>
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Security Settings</h2>
            <p className="text-gray-400 mb-6">Configure platform security options</p>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Require Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-400">Require 2FA for all admin accounts.</p>
                </div>
                <Switch 
                  checked={requireTwoFactor} 
                  onCheckedChange={setRequireTwoFactor}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Strong Password Policy</h4>
                  <p className="text-xs text-gray-400">Enforce complex passwords for all users.</p>
                </div>
                <Switch 
                  checked={strongPassword} 
                  onCheckedChange={setStrongPassword}
                />
              </div>
              
              <div>
                <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-300 mb-1">
                  Session Timeout (minutes)
                </label>
                <Input 
                  id="session-timeout" 
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)} 
                  className="bg-[#111111] border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Time before inactive users are automatically logged out.</p>
              </div>
              
              <div>
                <label htmlFor="max-login-attempts" className="block text-sm font-medium text-gray-300 mb-1">
                  Max Login Attempts
                </label>
                <Input 
                  id="max-login-attempts" 
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(e.target.value)} 
                  className="bg-[#111111] border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Number of failed login attempts before account lockout.</p>
              </div>
              
              <div>
                <label htmlFor="account-lockout" className="block text-sm font-medium text-gray-300 mb-1">
                  Account Lockout Duration (minutes)
                </label>
                <Input 
                  id="account-lockout" 
                  type="number"
                  value={accountLockout}
                  onChange={(e) => setAccountLockout(e.target.value)} 
                  className="bg-[#111111] border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">Time an account remains locked after exceeding max login attempts.</p>
              </div>
            </div>

            <Button className="mt-6" onClick={() => handleSaveChanges("Security")}>
              Save Changes
            </Button>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">API Keys</h2>
                <p className="text-gray-400">Manage API keys for external integrations</p>
              </div>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Generate New API Key
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-800">
                    <TableHead className="text-left py-3 px-4 text-gray-400">Description</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">API Key</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Created</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Last Used</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Status</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.length > 0 ? (
                    apiKeys.map((key, index) => (
                      <TableRow key={index} className="border-b border-gray-800">
                        {/* Key details would go here */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No API keys found. Generate a new key to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="team-members" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Team Members</h2>
                <p className="text-gray-400">Manage admin access to the platform</p>
              </div>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Invite Team Member
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-800">
                    <TableHead className="text-left py-3 px-4 text-gray-400">Name</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Email</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Role</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Last Active</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Status</TableHead>
                    <TableHead className="text-left py-3 px-4 text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member, index) => (
                      <TableRow key={index} className="border-b border-gray-800">
                        {/* Member details would go here */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No team members found. Invite team members to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
