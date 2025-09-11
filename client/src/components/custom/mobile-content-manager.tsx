'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  contentManagerService, 
  ContentType, 
  ContentItem, 
  ApiResponse 
} from '@/data/services/content-manager';
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
  Settings,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function MobileContentManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      await contentManagerService.login(email, password);
      setIsAuthenticated(true);
      toast.success('Successfully logged in!');
      loadContentTypes();
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Load content types
  const loadContentTypes = async () => {
    try {
      const types = await contentManagerService.getContentTypes();
      setContentTypes(types);
      if (types.length > 0) {
        setSelectedContentType(types[0].uid);
      }
    } catch (error) {
      toast.error('Failed to load content types');
    }
  };

  // Load content items
  const loadContentItems = async (contentType: string, page = 1) => {
    if (!contentType) return;
    
    setLoading(true);
    try {
      const response: ApiResponse<ContentItem[]> = await contentManagerService.getContentItems(
        contentType,
        {
          page,
          pageSize: 10,
          populate: '*',
          filters: searchTerm ? { title: searchTerm } : undefined
        }
      );
      
      setContentItems(response.data);
      setCurrentPage(page);
      setTotalPages(response.meta?.pagination?.pageCount || 1);
    } catch (error) {
      toast.error('Failed to load content items');
    } finally {
      setLoading(false);
    }
  };

  // Delete content item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await contentManagerService.deleteContentItem(selectedContentType, id);
      toast.success('Item deleted successfully');
      loadContentItems(selectedContentType, currentPage);
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  // Publish/Unpublish content item
  const handlePublishToggle = async (id: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await contentManagerService.unpublishContentItem(selectedContentType, id);
        toast.success('Item unpublished');
      } else {
        await contentManagerService.publishContentItem(selectedContentType, id);
        toast.success('Item published');
      }
      loadContentItems(selectedContentType, currentPage);
    } catch (error) {
      toast.error('Failed to update publish status');
    }
  };

  // Effects
  useEffect(() => {
    if (selectedContentType) {
      loadContentItems(selectedContentType, 1);
    }
  }, [selectedContentType]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedContentType) {
        loadContentItems(selectedContentType, 1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

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
                className="text-base" // Prevents zoom on iOS
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
                className="text-base" // Prevents zoom on iOS
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
          onClick={() => {
            setIsAuthenticated(false);
            contentManagerService.setToken('');
          }}
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base" // Prevents zoom on iOS
              />
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>

          {/* Content Items */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading content...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contentItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.attributes.title || item.attributes.name || `Item ${item.id}`}
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
                        onClick={() => handlePublishToggle(item.documentId, !!item.publishedAt)}
                        title={item.publishedAt ? "Unpublish" : "Publish"}
                      >
                        {item.publishedAt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.documentId)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {contentItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No content items found.</p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first item
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => loadContentItems(selectedContentType, currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => loadContentItems(selectedContentType, currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
