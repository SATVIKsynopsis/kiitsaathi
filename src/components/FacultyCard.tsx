import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Linkedin, X } from 'lucide-react';
import { FacultyMember as FacultyMemberType } from '@/hooks/useFacultyManagement';

interface FacultyCardProps {
  faculty: FacultyMemberType;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

export const FacultyCard = ({ faculty, isExpanded, onToggle }: FacultyCardProps) => {
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showLinkedIn, setShowLinkedIn] = useState(false);

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
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-[#006400]/20 bg-gradient-to-br from-white to-[#F5F5F5] dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-6">
        {/* Profile Image */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#006400] to-[#228B22] flex items-center justify-center ring-4 ring-[#F5F5F5] dark:ring-gray-700 transition-transform group-hover:scale-105">
            {faculty.photo_url ? (
              <img 
                src={faculty.photo_url} 
                alt={faculty.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Designation Badge */}
        <div className="flex justify-center mb-3">
          <Badge 
            className="bg-gradient-to-r from-[#006400] to-[#228B22] text-white px-3 py-1 text-xs font-medium"
          >
            {faculty.designation}
          </Badge>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-center mb-4 text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
          {faculty.name}
        </h3>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick('email')}
            className="border-[#1E90FF] text-[#1E90FF] hover:bg-[#1E90FF] hover:text-white transition-all"
          >
            <Mail className="w-4 h-4 mr-1" />
            {showEmail && isExpanded ? 'Hide' : 'Email'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick('phone')}
            className="border-[#006400] text-[#006400] hover:bg-[#006400] hover:text-white transition-all"
          >
            <Phone className="w-4 h-4 mr-1" />
            {showPhone && isExpanded ? 'Hide' : 'Phone'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleActionClick('linkedin')}
            className="border-[#228B22] text-[#228B22] hover:bg-[#228B22] hover:text-white transition-all"
          >
            <Linkedin className="w-4 h-4 mr-1" />
            LinkedIn
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (showEmail || showPhone || showLinkedIn) && (
          <div className="mt-4 pt-4 border-t border-[#006400]/20 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 text-sm space-y-2">
                {showEmail && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-[#1E90FF] flex-shrink-0" />
                    <a href={`mailto:${faculty.email}`} className="hover:underline break-all">
                      {faculty.email}
                    </a>
                  </div>
                )}
                {showPhone && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-[#006400] flex-shrink-0" />
                    <a href={`tel:${faculty.phone}`} className="hover:underline">
                      {faculty.phone}
                    </a>
                  </div>
                )}
                {showLinkedIn && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Linkedin className="w-4 h-4 text-[#228B22] flex-shrink-0" />
                    <a href={faculty.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                      View Profile
                    </a>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={hideAll}
                className="text-gray-500 hover:text-gray-700"
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
