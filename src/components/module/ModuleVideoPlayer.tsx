import { useState } from 'react';
import { Play, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ModuleVideoPlayerProps {
  videoUrl?: string | null;
  moduleTitle: string;
}

// Map module slugs to curated YouTube videos on cybersecurity topics
const VIDEO_MAP: Record<string, { url: string; title: string; duration: string }> = {
  'password-security-basics': {
    url: 'https://www.youtube.com/embed/3NjQ9b3pgIg',
    title: 'How Password Managers Work',
    duration: '3 min',
  },
  'phishing': {
    url: 'https://www.youtube.com/embed/Y7zNlEMDmI4',
    title: 'Spot the Phish: Real Examples',
    duration: '4 min',
  },
  'social-media-safety': {
    url: 'https://www.youtube.com/embed/nT3Yaw2TkiQ',
    title: 'Social Media Privacy Settings',
    duration: '3 min',
  },
  'network-security-basics': {
    url: 'https://www.youtube.com/embed/WzcvOuKpblE',
    title: 'How VPNs Actually Work',
    duration: '4 min',
  },
  'malware': {
    url: 'https://www.youtube.com/embed/n8mbzU0X2nQ',
    title: 'Malware Explained in 2 Minutes',
    duration: '2 min',
  },
  'cloud-security-fundamentals': {
    url: 'https://www.youtube.com/embed/jI8IKpjiCSM',
    title: 'Cloud Security Basics',
    duration: '3 min',
  },
  'mobile-device-security': {
    url: 'https://www.youtube.com/embed/GRMFBdDDTkI',
    title: 'Secure Your Phone Settings',
    duration: '3 min',
  },
  'identity-theft-protection': {
    url: 'https://www.youtube.com/embed/F0JMBZ1p3Cc',
    title: 'Identity Theft Prevention',
    duration: '4 min',
  },
};

export function ModuleVideoPlayer({ videoUrl, moduleTitle }: ModuleVideoPlayerProps) {
  const [watched, setWatched] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Find video by slug match in title (best effort)
  const slug = Object.keys(VIDEO_MAP).find(
    (key) => moduleTitle.toLowerCase().includes(key.replace(/-/g, ' ').replace('basics', '').trim())
  );
  
  const video = slug ? VIDEO_MAP[slug] : null;
  const embedUrl = videoUrl || video?.url;

  if (!embedUrl) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Video Lesson
          {video && (
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              {video.duration}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {playing ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={`${embedUrl}?autoplay=1&rel=0`}
              title={video?.title || 'Module Video'}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
              <p className="text-sm font-medium">{video?.title || 'Watch Video'}</p>
            </div>
          </button>
        )}

        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant={watched ? 'default' : 'outline'}
            onClick={() => setWatched(!watched)}
            className={watched ? 'bg-success hover:bg-success/90' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {watched ? 'Watched' : 'Mark as Watched'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
