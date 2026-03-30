import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetUrl, portfolioAPI } from '@/lib/api';
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  ExternalLink,
  Github,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { LiquidButton } from '@/components/ui/button';
import { ImageCropper } from '@/components/ui/ImageCropper';

const PortfolioForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'graphic-design' as 'graphic-design' | 'web-ai',
    externalUrl: '',
    githubUrl: '',
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [croppingUrl, setCroppingUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const item = await portfolioAPI.getById(id!);
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        externalUrl: item.externalUrl || '',
        githubUrl: item.githubUrl || '',
      });
      setExistingImages(item.images || []);
    } catch (error) {
      toast.error('Failed to load item');
      navigate('/admin/portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImages((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = async (imagePath: string) => {
    if (isEditing) {
      try {
        await portfolioAPI.deleteImage(id!, imagePath);
        setExistingImages((prev) => prev.filter((img) => img !== imagePath));
        toast.success('Image removed');
      } catch (error) {
        toast.error('Failed to remove image');
      }
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (urlInput.trim()) {
      setCroppingUrl(urlInput.trim());
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setNewImages((prev) => [...prev, file]);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrls((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);

    setCroppingUrl(null);
    setUrlInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (isEditing && existingImages.length === 0 && newImages.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    if (!isEditing && newImages.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('externalUrl', formData.externalUrl);
      data.append('githubUrl', formData.githubUrl);

      // Append existing images for editing
      if (isEditing) {
        data.append('existingImages', JSON.stringify(existingImages));
      }

      // Append new images
      newImages.forEach((image) => {
        data.append('images', image);
      });

      if (isEditing) {
        await portfolioAPI.update(id!, data);
        toast.success('Project updated successfully');
      } else {
        await portfolioAPI.create(data);
        toast.success('Project created successfully');
      }

      navigate('/admin/portfolio');
    } catch (error) {
      toast.error(isEditing ? 'Failed to update project' : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/portfolio')}
          className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Update your project details'
              : 'Add a new project to your portfolio'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-bold">Basic Information</h2>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Brand Identity System"
              className="form-input"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              rows={4}
              className="form-input resize-none"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="graphic-design">Graphic Design</option>
              <option value="web-ai">Web/AI Works</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-bold">Images</h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Current Images</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={getAssetUrl(image)}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {previewUrls.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">New Images</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* Upload Button */}
          <div>
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-foreground transition-colors bg-muted/50">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload images</span>
                <span className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 10MB</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            
            <div className="mt-4 flex gap-2">
              <input 
                type="url" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                placeholder="Or paste an image URL..."
                className="form-input flex-1"
              />
              <LiquidButton
                type="button"
                variant="outline"
                onClick={handleAddImageUrl}
                className="whitespace-nowrap bg-background"
              >
                Add URL
              </LiquidButton>
            </div>
          </div>
        </div>

        {/* Links (for Web/AI only) */}
        {formData.category === 'web-ai' && (
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-bold">Project Links</h2>

            <div>
              <label
                htmlFor="externalUrl"
                className="block text-sm font-medium mb-2"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Live Demo URL
                </span>
              </label>
              <input
                type="url"
                id="externalUrl"
                name="externalUrl"
                value={formData.externalUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                className="form-input"
              />
            </div>

            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium mb-2"
              >
                <span className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Repository
                </span>
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <LiquidButton
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/portfolio')}
            className="px-6 py-3 font-medium border-border text-foreground hover:bg-muted"
          >
            Cancel
          </LiquidButton>
          <LiquidButton
            type="submit"
            variant="default"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditing ? 'Update Project' : 'Create Project'}
              </>
            )}
          </LiquidButton>
        </div>
      </form>

      {croppingUrl && (
        <ImageCropper
          imageSrc={croppingUrl}
          aspectRatio={4 / 3}
          onCropCompleteAction={handleCropComplete}
          onCancel={() => {
            setCroppingUrl(null);
            setUrlInput('');
          }}
        />
      )}
    </div>
  );
};

export default PortfolioForm;
