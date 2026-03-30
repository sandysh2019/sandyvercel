import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAssetUrl, portfolioAPI } from '@/lib/api';
import type { PortfolioItem } from '@/types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  Github,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const PortfolioAdmin = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await portfolioAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load portfolio items:', error);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await portfolioAPI.delete(deleteItem.id);
      toast.success('Item deleted successfully');
      loadItems();
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteItem(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Portfolio</h1>
          <p className="text-muted-foreground">Manage your projects and work</p>
        </div>
        <Link
          to="/admin/portfolio/new"
          className="btn-premium inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input pl-12"
        />
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Start by adding your first project'}
          </p>
          {!searchQuery && (
            <Link
              to="/admin/portfolio/new"
              className="btn-premium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="glass-card overflow-hidden group">
              {/* Image */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={getAssetUrl(item.images[0])}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.category === 'graphic-design'
                        ? 'bg-purple-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {item.category === 'graphic-design'
                      ? 'Graphic Design'
                      : 'Web/AI'}
                  </span>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/admin/portfolio/edit/${item.id}`)}
                    className="w-9 h-9 rounded-lg bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="w-9 h-9 rounded-lg bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Count */}
                {item.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/70 text-white text-xs">
                    {item.images.length} images
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {item.description}
                </p>

                {/* Links */}
                {item.category === 'web-ai' && (
                  <div className="flex gap-3 mb-4">
                    {item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live
                      </a>
                    )}
                    {item.githubUrl && (
                      <a
                        href={item.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="w-4 h-4" />
                        Code
                      </a>
                    )}
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-muted-foreground/60">
                  Added on {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteItem?.title}" and all its
              images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PortfolioAdmin;
