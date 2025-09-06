import { useState, useEffect } from 'react';
import { Instagram, Facebook, Linkedin, MessageCircle, ExternalLink } from 'lucide-react';
import { supabase, SocialLink } from '@/lib/supabase';

interface SocialLinksProps {
  variant?: 'header' | 'footer' | 'floating';
  className?: string;
}

const getIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return <Instagram className="w-5 h-5" />;
    case 'facebook':
      return <Facebook className="w-5 h-5" />;
    case 'linkedin':
      return <Linkedin className="w-5 h-5" />;
    case 'whatsapp':
      return <MessageCircle className="w-5 h-5" />;
    default:
      return <ExternalLink className="w-5 h-5" />;
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'from-pink-500 to-purple-600';
    case 'facebook':
      return 'from-blue-600 to-blue-700';
    case 'linkedin':
      return 'from-blue-700 to-blue-800';
    case 'whatsapp':
      return 'from-green-500 to-green-600';
    default:
      return 'from-slate-500 to-slate-600';
  }
};

export default function SocialLinks({ variant = 'header', className = '' }: SocialLinksProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching social links:', error);
        return;
      }

      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex space-x-3 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-slate-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (socialLinks.length === 0) {
    return null;
  }

  const renderLink = (link: SocialLink) => {
    const baseClasses = "transition-all duration-300 flex items-center justify-center";
    
    if (variant === 'header') {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} w-10 h-10 rounded-lg bg-gradient-to-r ${getPlatformColor(link.platform)} text-white hover:scale-110 hover:shadow-lg`}
          title={`Siga-nos no ${link.platform}`}
        >
          {getIcon(link.platform)}
        </a>
      );
    }

    if (variant === 'footer') {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:scale-110`}
          title={`Siga-nos no ${link.platform}`}
        >
          {getIcon(link.platform)}
        </a>
      );
    }

    if (variant === 'floating') {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} w-14 h-14 rounded-full bg-gradient-to-r ${getPlatformColor(link.platform)} text-white shadow-lg hover:scale-110 hover:shadow-xl mb-3 last:mb-0`}
          title={`Siga-nos no ${link.platform}`}
        >
          {getIcon(link.platform)}
        </a>
      );
    }

    return null;
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed right-6 bottom-6 z-40 flex flex-col ${className}`}>
        {socialLinks.map(renderLink)}
      </div>
    );
  }

  return (
    <div className={`flex space-x-3 ${className}`}>
      {socialLinks.map(renderLink)}
    </div>
  );
}

