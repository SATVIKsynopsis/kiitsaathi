import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

// Cache for storing preloaded images and their status
const imageCache = new Map<string, {
  url: string;
  status: 'loading' | 'loaded' | 'error';
  retryCount?: number;
}>();

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second
const FALLBACK_IMAGE_URL = 'https://storage.googleapis.com/kiitsaathi.appspot.com/faculty-photos/fallback.jpg';
const LOAD_TIMEOUT = 40000; // 10 seconds timeout

export function useFacultyPhotos() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const isAdmin =
    user?.email === "adityash8997@gmail.com" ||
    user?.email === "24155598@kiit.ac.in";
  const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

  // Sleep utility function
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Preload image with retries
  const preloadImage = useCallback((url: string, retryCount = 0): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      // Check cache first
      if (imageCache.has(url)) {
        const cached = imageCache.get(url)!;
        if (cached.status === 'loaded') {
          return resolve(cached.url);
        } else if (cached.status === 'error' && (cached.retryCount || 0) >= MAX_RETRIES) {
          return resolve(FALLBACK_IMAGE_URL); // Return fallback instead of rejection
        }
      }

      // Set initial cache state
      imageCache.set(url, { url, status: 'loading', retryCount });

      try {
        const img = new Image();
        
        const loadPromise = new Promise<string>((resolveLoad, rejectLoad) => {
          img.onload = () => resolveLoad(url);
          img.onerror = () => rejectLoad(new Error('Image failed to load'));
        });

        // Add timeout to the image loading
        const timeoutPromise = new Promise<string>((resolveTimeout) => {
          setTimeout(() => resolveTimeout(FALLBACK_IMAGE_URL), LOAD_TIMEOUT);
        });

        img.src = url;
        const resultUrl = await Promise.race([loadPromise, timeoutPromise]);
        
        if (resultUrl === FALLBACK_IMAGE_URL) {
          imageCache.set(url, { url: FALLBACK_IMAGE_URL, status: 'error', retryCount: MAX_RETRIES });
          resolve(FALLBACK_IMAGE_URL);
        } else {
          imageCache.set(url, { url, status: 'loaded', retryCount });
          resolve(url);
        }
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          // Wait before retrying
          await sleep(RETRY_DELAY * (retryCount + 1));
          try {
            const result = await preloadImage(url, retryCount + 1);
            resolve(result);
          } catch (retryError) {
            imageCache.set(url, { url: FALLBACK_IMAGE_URL, status: 'error', retryCount: MAX_RETRIES });
            resolve(FALLBACK_IMAGE_URL); // Return fallback instead of rejection
          }
        } else {
          imageCache.set(url, { url: FALLBACK_IMAGE_URL, status: 'error', retryCount: MAX_RETRIES });
          resolve(FALLBACK_IMAGE_URL); // Return fallback instead of rejection
        }
      }
    });
  }, []);

  const getPhotoUrl = useCallback(async (facultyId: string) => {
    if (!facultyId) {
      console.error("Faculty ID is required");
      return FALLBACK_IMAGE_URL;
    }

    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(
        `${HOSTED_URL}/api/faculty/photo-url?facultyId=${facultyId}&t=${timestamp}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        return FALLBACK_IMAGE_URL;
      }

      const data = await response.json();
      if (!data.photoUrl) {
        return FALLBACK_IMAGE_URL;
      }

      // Validate and clean URL
      const url = new URL(data.photoUrl);
      const cleanUrl = url.toString();

      // Add timestamp to image URL to prevent caching
      const urlWithTimestamp = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}t=${timestamp}`;

      try {
        const resultUrl = await preloadImage(urlWithTimestamp);
        return resultUrl; // This will either be the actual URL or the fallback
      } catch (error) {
        console.error("Image preload failed:", error);
        return FALLBACK_IMAGE_URL;
      }
    } catch (error) {
      console.error("Error fetching faculty photo URL:", error);
      return FALLBACK_IMAGE_URL;
    }
  }, [HOSTED_URL, preloadImage]);

  const uploadPhoto = async (facultyId: string, file: File) => {
    if (!isAdmin) {
      toast.error("Unauthorized access");
      return null;
    }

    // Enhanced file validation
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error("Only JPG and PNG files are allowed");
      return null;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return null;
    }

    // Check image dimensions before upload
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width < 200 || dimensions.height < 200) {
        toast.error("Image dimensions must be at least 200x200 pixels");
        return null;
      }
    } catch (error) {
      toast.error("Invalid image file");
      return null;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("facultyId", facultyId);
      formData.append("photo", file);

      const response = await fetch(`${HOSTED_URL}/api/faculty/upload-photo`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text() || "Failed to upload photo");
      }

      const result = await response.json();
      if (!result.photoUrl) {
        throw new Error("No photo URL returned");
      }

      // Clear the cache for this faculty's photo
      const oldUrl = await getPhotoUrl(facultyId);
      if (oldUrl) {
        imageCache.delete(oldUrl);
      }

      // Preload the new image
      await preloadImage(result.photoUrl);
      
      toast.success("Profile photo updated successfully");
      return result.photoUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload photo");
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Helper function to check image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    isAdmin,
    uploading,
    getPhotoUrl,
    uploadPhoto,
  };
}
