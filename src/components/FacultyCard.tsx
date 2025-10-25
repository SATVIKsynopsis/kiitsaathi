import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Linkedin, X, Camera } from 'lucide-react';
import { FacultyMember } from '@/data/facultyData';
import { useFacultyPhotos } from '@/hooks/useFacultyPhotos';

interface FacultyCardProps {
  faculty: FacultyMember;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export const FacultyCard = ({ faculty, isExpanded, onToggle }: FacultyCardProps) => {
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin, uploading, getPhotoUrl, uploadPhoto } = useFacultyPhotos();

  // Load photo on mount
  useState(() => {
    const url = getPhotoUrl(faculty.id);
    setPhotoUrl(url);
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newUrl = await uploadPhoto(faculty.id, file);
    if (newUrl) {
      setPhotoUrl(newUrl + '?t=' + Date.now());
    }
    setShowUploadOverlay(false);
  };

  const handleActionClick = (action: 'email' | 'phone' | 'linkedin') => {
    if (!isExpanded) {
      onToggle(faculty.id);
    }
    
    setShowEmail(action === 'email' ? !showEmail : false);
    setShowPhone(action === 'phone' ? !showPhone : false);
    setShowLinkedIn(action === 'linkedin' ? !showLinkedIn : false);
  };

  const hideAll = () => {
    setShowEmail(false);
    setShowPhone(false);
    setShowLinkedIn(false);
    onToggle('');
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 bg-white dark:from-gray-900 dark:to-gray-800 rounded-xl">
      <CardContent className="p-6">
        {/* Profile Image */}
        <div className="flex justify-center mb-5">
          <div 
            className="relative w-24 h-24 rounded-full group/photo cursor-pointer"
            onMouseEnter={() => isAdmin && setShowUploadOverlay(true)}
            onMouseLeave={() => !uploading && setShowUploadOverlay(false)}
            onClick={() => isAdmin && fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#006400] to-[#228B22] flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700 transition-all group-hover:ring-4 overflow-hidden">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={faculty.name}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setPhotoUrl('')}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Upload Overlay - Admin Only */}
            {isAdmin && showUploadOverlay && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center transition-opacity animate-fade-in">
                <div className="text-center">
                  <Camera className="w-7 h-7 text-white mx-auto mb-1" />
                  <span className="text-xs text-white font-medium">
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Hidden File Input */}
            {isAdmin && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />
            )}
          </div>
        </div>

        {/* School Badge */}
        <div className="flex justify-center mb-3">
          <Badge 
            className="bg-gradient-to-r from-[#006400] to-[#228B22] text-white px-3 py-1 text-xs font-medium shadow-sm"
          >
            {faculty.school || 'School of Computer Engineering'}
          </Badge>
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem] flex items-center justify-center px-2">
          {faculty.name}{faculty.school === 'School of Management' && faculty.designation && faculty.designation !== 'Adding Soon..' ? ` (${faculty.designation})` : ''}
        </h3>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick('email')}
            className="border-gray-300 text-gray-700 hover:border-[#1E90FF] hover:bg-[#1E90FF] hover:text-white transition-all shadow-sm"
          >
            <Mail className="w-4 h-4 mr-1.5" />
            {showEmail && isExpanded ? 'Hide' : 'Email'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick('phone')}
            className="border-gray-300 text-gray-700 hover:border-[#006400] hover:bg-[#006400] hover:text-white transition-all shadow-sm"
          >
            <Phone className="w-4 h-4 mr-1.5" />
            {showPhone && isExpanded ? 'Hide' : 'Phone'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick('linkedin')}
            className="border-gray-300 text-gray-700 hover:border-[#228B22] hover:bg-[#228B22] hover:text-white transition-all shadow-sm"
          >
            <Linkedin className="w-4 h-4 mr-1.5" />
            LinkedIn
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (showEmail || showPhone || showLinkedIn) && (
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 text-sm space-y-2.5">
                {showEmail && (
                  <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-[#1E90FF] flex-shrink-0" />
                    <a href={`mailto:${faculty.email}`} className="hover:text-[#1E90FF] hover:underline break-all transition-colors">
                      {faculty.email}
                    </a>
                  </div>
                )}
                {showPhone && (
                  <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-[#006400] flex-shrink-0" />
                    <a href={`tel:${faculty.phone}`} className="hover:text-[#006400] hover:underline transition-colors">
                      {faculty.phone}
                    </a>
                  </div>
                )}
                {showLinkedIn && (
                  <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                    <Linkedin className="w-4 h-4 text-[#228B22] flex-shrink-0" />
                    <a href={faculty.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[#228B22] hover:underline break-all transition-colors">
                      View Profile
                    </a>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={hideAll}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};