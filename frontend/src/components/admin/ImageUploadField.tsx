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
        toast.success("Artwork uploaded. Save the game to apply it.");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <GameImage
        src={currentUrl}
        name={name || "Game"}
        width={200}
        className="size-24 rounded-lg"
      />
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
          JPEG, PNG or WebP, up to 2 MB.
        </p>
      </div>
    </div>
  );
}
