'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, EyeOff, Trash2, Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { Post } from '@/data/services/posts-api';
import { getStrapiURL } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  onTogglePublish: (post: Post) => void;
}
  
export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  const API_BASE = getStrapiURL()
  const router = useRouter()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border">
      {post.image && (
        <div className="h-48 bg-muted">
          <img
            src={`${API_BASE}${post.image.url}`}
            alt={post.image.alternativeText || post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">
            {post.title}
          </h3>
        </div>

        {post.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {post.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            {post.category && (
              <Badge variant="secondary" className="flex items-center bg-secondary text-secondary-foreground">
                <Tag className="w-3 h-3 mr-1" />
                {post.category.text || 'Unknown Category'}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(post)}
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTogglePublish(post)}
              title={post.publishedAt ? 'Unpublish' : 'Publish'}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(post)}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/blog/${post.slug}`)}
              title="View Blog"
            >
              {post.status === 'published' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </Button>
          </div>
          <Badge
            variant={
              post.status === 'published'
                ? 'default'
                : post.status === 'modified'
                ? 'outline'
                : 'secondary'
            }
          >
            {post.status === 'published'
              ? 'Published'
              : post.status === 'modified'
              ? 'Modified'
              : 'Draft'}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
