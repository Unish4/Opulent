import { useRef, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import GameImage from "../game/GameImage";
import { Button } from "../ui";
import {
  useUploadArtwork,
  type UploadedImage,
} from "../../hooks/useAdminGames";

interface ImageUploadFieldProps {
  name: string;
  currentUrl: string | null;
  onUploaded: (image: UploadedImage) => void;
}

export default function ImageUploadField({
  name,
  currentUrl,
  onUploaded,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadArtwork();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    upload.mutate(file, {
      onSuccess: (image) => {
        onUploaded(image);
        toast.success(
          "Artwork uploaded! Click 'Save changes' at the bottom to apply it to the game.",
          { duration: 5000 },
        );
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
        <GameImage
          src={currentUrl}
          name={name || "Game"}
          width={200}
          className="size-full object-cover object-center"
        />
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onChange}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={16} /> Upload artwork
        </Button>
        <p className="mt-2 text-xs text-muted">
          JPEG, PNG or WebP, up to 5 MB. Remember to save the form after uploading.
        </p>
      </div>
    </div>
  );
}
