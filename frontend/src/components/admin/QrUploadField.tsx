import { useRef, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { Button } from "../ui";
import { useUploadPaymentQr } from "../../hooks/useAdminSettings";

interface QrUploadFieldProps {
  currentUrl: string;
  onUploaded: (url: string) => void;
}

export default function QrUploadField({
  currentUrl,
  onUploaded,
}: QrUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadPaymentQr();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    upload.mutate(file, {
      onSuccess: (image) => {
        onUploaded(image.url);
        toast.success("QR uploaded. Save to apply it.");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex items-center gap-4">
      {currentUrl ? (
        <img
          src={currentUrl}
          alt="Current payment QR"
          className="size-32 rounded-lg bg-white p-2"
        />
      ) : (
        <div className="flex size-32 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
          No QR yet
        </div>
      )}
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
          <Upload size={16} /> Upload QR
        </Button>
        <p className="mt-2 text-xs text-muted">
          Crop to the QR with its white border. JPEG, PNG or WebP, up to 2 MB.
        </p>
      </div>
    </div>
  );
}
