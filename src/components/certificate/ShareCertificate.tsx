import { Share2, Linkedin, Twitter, Mail, Link, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ShareCertificateProps {
  certificateNumber: string;
  verificationUrl: string;
  studentName: string;
}

export function ShareCertificate({ certificateNumber, verificationUrl, studentName }: ShareCertificateProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 I just earned my Cybersecurity Fundamentals certificate from CyberSafe! I completed training on Password Security, Phishing Detection, and Social Media Safety. Verify my certificate: ${verificationUrl}`;
  
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}&summary=${encodeURIComponent(shareText)}`;
  
  const twitterText = `🎉 Just earned my Cybersecurity Fundamentals certificate from @CyberSafe! #Cybersecurity #DigitalSafety #Learning`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(verificationUrl)}`;
  
  const emailSubject = `I earned my CyberSafe Certificate!`;
  const emailBody = `Hi,\n\nI'm excited to share that I've successfully completed the Cybersecurity Fundamentals course from CyberSafe!\n\nCertificate Number: ${certificateNumber}\n\nYou can verify my certificate here: ${verificationUrl}\n\nBest regards,\n${studentName}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Verification link copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg">
          <Share2 className="mr-2 h-5 w-5" />
          Share Certificate
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem asChild>
          <a 
            href={linkedInUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center cursor-pointer"
          >
            <Linkedin className="mr-2 h-4 w-4 text-[#0077B5]" />
            Share on LinkedIn
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={twitterUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center cursor-pointer"
          >
            <Twitter className="mr-2 h-4 w-4 text-[#1DA1F2]" />
            Share on Twitter
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={emailUrl}
            className="flex items-center cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-success" />
          ) : (
            <Link className="mr-2 h-4 w-4" />
          )}
          Copy Verification Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
