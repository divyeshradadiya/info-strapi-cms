'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Settings
} from 'lucide-react';

// Simple toast function without external library
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
};

export default function SimpleContentManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Mock content types for now
  const contentTypes = [
    { uid: 'api::category.category', displayName: 'Category' },
    { uid: 'api::post.post', displayName: 'Post' },
    { uid: 'api::page.page', displayName: 'Page' },
    { uid: 'api::user.user', displayName: 'User' },
  ];

  // Mock content items for now
  const contentItems = [
    {
      id: 1,
      documentId: 'doc1',
      attributes: { title: 'Sample Category' },
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    },
    {
      id: 2,
      documentId: 'doc2',
      attributes: { title: 'Another Item' },
      updatedAt: new Date().toISOString(),
      publishedAt: null,
    },
  ];

  const [selectedContentType, setSelectedContentType] = useState(contentTypes[0]?.uid || '');

  // Mock login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        setIsAuthenticated(true);
        showToast('Successfully logged in!', 'success');
      } else {
        showToast('Please enter email and password', 'error');
      }
      setAuthLoading(false);
    }, 1000);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
            <p className="text-gray-600">Sign in to manage your content</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="text-base"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={authLoading}
            >
              {authLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden"
          >
            {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Content Manager</h1>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsAuthenticated(false)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`
          fixed md:relative top-0 left-0 z-30 w-64 h-screen bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 pt-16 md:pt-0
        `}>
          <div className="p-4 space-y-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Content Types</h2>
            <div className="space-y-1">
              {contentTypes.map((type) => (
                <Button
                  key={type.uid}
                  variant={selectedContentType === type.uid ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setSelectedContentType(type.uid);
                    setShowSidebar(false);
                  }}
                >
                  {type.displayName}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 space-y-4">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search content..."
                className="pl-10 text-base"
              />
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>

          {/* Content Items */}
          <div className="space-y-3">
            {contentItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.attributes.title || `Item ${item.id}`}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={item.publishedAt ? "default" : "secondary"}>
                        {item.publishedAt ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => showToast(`${item.publishedAt ? 'Unpublished' : 'Published'} item`, 'success')}
                      title={item.publishedAt ? "Unpublish" : "Publish"}
                    >
                      {item.publishedAt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      onClick={() => showToast('Edit functionality coming soon', 'success')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this item?')) {
                          showToast('Item deleted successfully', 'success');
                        }
                      }}
                      title="Delete"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page 1 of 1
            </span>
            
            <Button variant="outline" className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
