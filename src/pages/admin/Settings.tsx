import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { settingsAPI, getAssetUrl } from '@/lib/api';
import type { SiteSettings } from '@/types';
import { ImageCropper } from '@/components/ui/ImageCropper';
import {
  Save,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { changePassword } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [titleIconFile, setTitleIconFile] = useState<File | null>(null);

  const [heroImageUrlInput, setHeroImageUrlInput] = useState<string>('');
  const [aboutImageUrlInput, setAboutImageUrlInput] = useState<string>('');
  const [titleIconUrlInput, setTitleIconUrlInput] = useState<string>('');

  const [cropState, setCropState] = useState<{
    imageSrc: string;
    type: 'hero' | 'about' | 'titleIcon';
    aspectRatio: number;
    filename: string;
    mimeType: string;
  } | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.get();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : null
    );
  };

  const handleImageSelectForCrop = (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'about' | 'titleIcon', aspectRatio: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropState({
          imageSrc: reader.result as string,
          type,
          aspectRatio,
          filename: file.name,
          mimeType: file.type || 'image/jpeg'
        });
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input to allow selecting same file again
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (cropState) {
      const newFile = new File([croppedBlob], cropState.filename, { type: cropState.mimeType });
      if (cropState.type === 'hero') {
        setHeroImageFile(newFile);
        setHeroImageUrlInput('');
      } else if (cropState.type === 'about') {
        setAboutImageFile(newFile);
        setAboutImageUrlInput('');
      } else {
        setTitleIconFile(newFile);
        setTitleIconUrlInput('');
      }
      setCropState(null);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      
      const formData = new FormData();
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (['_id', 'id', 'createdAt', 'updatedAt', '__v'].includes(key)) return;
          if (key === 'heroImage' || key === 'aboutImage') return;
          formData.append(key, value.toString());
        }
      });
      
      const heroImageFinal = heroImageUrlInput || settings.heroImage || '';
      formData.append('heroImage', heroImageFinal);
      
      if (heroImageFile) {
        formData.append('heroImageFile', heroImageFile);
      }
      
      const aboutImageFinal = aboutImageUrlInput || settings.aboutImage || '';
      formData.append('aboutImage', aboutImageFinal);
      
      if (aboutImageFile) {
        formData.append('aboutImageFile', aboutImageFile);
      }

      const titleIconFinal = titleIconUrlInput || settings.titleIcon || '';
      formData.append('titleIcon', titleIconFinal);
      
      if (titleIconFile) {
        formData.append('titleIconFile', titleIconFile);
      }

      await settingsAPI.update(formData);
      
      toast.success('Settings saved successfully');
      loadSettings(); // Reload to pick up new image paths
      setHeroImageFile(null);
      setAboutImageFile(null);
      setTitleIconFile(null);
      setHeroImageUrlInput('');
      setAboutImageUrlInput('');
      setTitleIconUrlInput('');
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
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
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your site settings and account</p>
      </div>

      {/* Site Settings */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Site Information</h2>
            <p className="text-sm text-gray-500">Update your site details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium mb-2">
              Site Title
            </label>
            <input
              type="text"
              id="siteTitle"
              name="siteTitle"
              value={settings?.siteTitle || ''}
              onChange={handleSettingsChange}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium mb-2">
              Site Description
            </label>
            <input
              type="text"
              id="siteDescription"
              name="siteDescription"
              value={settings?.siteDescription || ''}
              onChange={handleSettingsChange}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium mb-2">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Email
              </span>
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={settings?.contactEmail || ''}
              onChange={handleSettingsChange}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={settings?.phone || ''}
              onChange={handleSettingsChange}
              className="form-input"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="location" className="block text-sm font-medium mb-2">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={settings?.location || ''}
              onChange={handleSettingsChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Profile Images Section */}
        <div className="border-t border-border pt-6 mt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Profile & Site Images
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hero Image */}
            <div>
              <label className="block text-sm font-medium mb-3">Hero Section Image</label>
              <div className="flex flex-col gap-4">
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-muted/30 border border-border flex items-center justify-center">
                  {heroImageUrlInput ? (
                    <img src={heroImageUrlInput} alt="Hero Preview" className="w-full h-full object-cover" />
                  ) : heroImageFile ? (
                    <img src={URL.createObjectURL(heroImageFile)} alt="Hero Preview" className="w-full h-full object-cover" />
                  ) : settings?.heroImage ? (
                    <img src={getAssetUrl(settings.heroImage)} alt="Current Hero" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageSelectForCrop(e, 'hero', 4/5)}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-transparent"
                />
                <input
                  type="text"
                  placeholder="Or paste an image URL..."
                  value={heroImageUrlInput}
                  onChange={(e) => {
                    setHeroImageUrlInput(e.target.value);
                    if (e.target.value) setHeroImageFile(null);
                  }}
                  className="form-input text-sm mt-1"
                />
                <p className="text-xs text-muted-foreground">Pick a file to crop, or paste a direct URL link.</p>
              </div>
            </div>

            {/* About Image */}
            <div>
              <label className="block text-sm font-medium mb-3">About Section Image</label>
              <div className="flex flex-col gap-4">
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-muted/30 border border-border flex items-center justify-center">
                  {aboutImageUrlInput ? (
                    <img src={aboutImageUrlInput} alt="About Preview" className="w-full h-full object-cover" />
                  ) : aboutImageFile ? (
                    <img src={URL.createObjectURL(aboutImageFile)} alt="About Preview" className="w-full h-full object-cover" />
                  ) : settings?.aboutImage ? (
                    <img src={getAssetUrl(settings.aboutImage)} alt="Current About" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageSelectForCrop(e, 'about', 4/5)}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-transparent"
                />
                <input
                  type="text"
                  placeholder="Or paste an image URL..."
                  value={aboutImageUrlInput}
                  onChange={(e) => {
                    setAboutImageUrlInput(e.target.value);
                    if (e.target.value) setAboutImageFile(null);
                  }}
                  className="form-input text-sm mt-1"
                />
                <p className="text-xs text-muted-foreground">Pick a file to crop, or paste a direct URL link.</p>
              </div>
            </div>

            {/* Title Icon */}
            <div>
              <label className="block text-sm font-medium mb-3">Website Title Icon</label>
              <div className="flex flex-col gap-4">
                <div className="w-40 h-40 rounded-xl overflow-hidden bg-muted/30 border border-border flex items-center justify-center">
                  {titleIconUrlInput ? (
                    <img src={titleIconUrlInput} alt="Title Icon Preview" className="w-full h-full object-cover" />
                  ) : titleIconFile ? (
                    <img src={URL.createObjectURL(titleIconFile)} alt="Title Icon Preview" className="w-full h-full object-cover" />
                  ) : settings?.titleIcon ? (
                    <img src={getAssetUrl(settings.titleIcon)} alt="Current Title Icon" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageSelectForCrop(e, 'titleIcon', 1)}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 bg-transparent"
                />
                <input
                  type="text"
                  placeholder="Or paste an image URL..."
                  value={titleIconUrlInput}
                  onChange={(e) => {
                    setTitleIconUrlInput(e.target.value);
                    if (e.target.value) setTitleIconFile(null);
                  }}
                  className="form-input text-sm mt-1"
                />
                <p className="text-xs text-muted-foreground">Crop to 1:1 format for the best icon.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-premium flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Change Password</h2>
            <p className="text-sm text-gray-500">Update your admin password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium mb-2"
            >
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="form-input pr-12"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="form-input pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="form-input pr-12"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="btn-premium flex items-center gap-2 disabled:opacity-70"
          >
            {changingPassword ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>

      {/* Cropper Modal */}
      {cropState && (
        <ImageCropper
          imageSrc={cropState.imageSrc}
          aspectRatio={cropState.aspectRatio}
          onCropCompleteAction={handleCropComplete}
          onCancel={() => setCropState(null)}
        />
      )}
    </div>
  );
};

export default Settings;
