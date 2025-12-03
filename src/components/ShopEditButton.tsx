import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit3, Settings } from "lucide-react";
import { ShopEditForm } from "./ShopEditForm";

interface ShopEditButtonProps {
  shopId: string;
  shopName?: string;
  className?: string;
}

const HOSTED_URL = 'https://kiitsaathi-hosted.onrender.com';

export const ShopEditButton = ({ shopId, shopName, className }: ShopEditButtonProps) => {
  const { user, accessToken } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = accessToken || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check if current user is admin - same logic as Navbar
  const isAdmin = user?.email === 'adityash8997@gmail.com' || user?.email === '24155598@kiit.ac.in';

  // Don't render anything if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowEditForm(true)}
        className={`bg-white/90 hover:bg-white border border-blue-200 text-blue-700 hover:text-blue-800 shadow-md hover:shadow-lg transition-all duration-200 ${className}`}
      >
        <Edit3 className="h-4 w-4 mr-1" />
        Edit
      </Button>

      {showEditForm && createPortal(
        <ShopEditForm
          shopId={shopId}
          onClose={() => setShowEditForm(false)}
        />,
        document.body
      )}
    </>
  );
};