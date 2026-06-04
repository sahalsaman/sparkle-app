"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/upload/image-upload";
import { submitToChallenge } from "@/app/actions/challenges";

export function SubmitForm({
  challengeId,
  cloudinaryEnabled,
  requiresMedia,
}: {
  challengeId: string;
  cloudinaryEnabled: boolean;
  requiresMedia: boolean;
}) {
  const [media, setMedia] = useState("");
  const [caption, setCaption] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const disabled = pending || (requiresMedia && !media);

  return (
    <div className="space-y-3 rounded-2xl border bg-card/40 p-4">
      <p className="text-sm font-medium">Submit your entry</p>
      {requiresMedia && (
        <div className="space-y-2">
          <Label>Photo / video URL</Label>
          {cloudinaryEnabled ? (
            <ImageUpload
              folder={`challenges/${challengeId}`}
              onUploaded={setMedia}
              label={media ? "Replace upload" : "Upload from device"}
            />
          ) : (
            <Input
              placeholder="https://…"
              value={media}
              onChange={(e) => setMedia(e.target.value)}
            />
          )}
          {media && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media} alt="" className="h-32 rounded-xl object-cover" />
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Input
          id="caption"
          maxLength={280}
          placeholder="Say something about it…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        type="button"
        variant="gradient"
        disabled={disabled}
        onClick={() => {
          setError(null);
          start(async () => {
            try {
              await submitToChallenge({ challengeId, media, caption });
              setMedia("");
              setCaption("");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed");
            }
          });
        }}
      >
        {pending && <Loader2 className="animate-spin" />} Submit entry
      </Button>
      {!cloudinaryEnabled && requiresMedia && (
        <p className="text-xs text-muted-foreground">
          Cloudinary is not configured — paste a public image URL above.
        </p>
      )}
    </div>
  );
}
