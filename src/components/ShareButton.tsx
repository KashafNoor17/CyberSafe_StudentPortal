import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNativeShare } from '@/hooks/useNativeShare';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
}

export function ShareButton({
  title,
  text,
  url,
  variant = 'outline',
  size = 'sm',
  className = '',
}: ShareButtonProps) {
  const { share } = useNativeShare();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const result = await share({ title, text, url });

    if (result.shared) {
      toast.success('Shared successfully!');
    } else if (result.copied) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleShare} className={className}>
      {copied ? (
        <Check className="h-4 w-4 mr-1" />
      ) : (
        <Share2 className="h-4 w-4 mr-1" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}
