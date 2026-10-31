import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import ErrorState from "../../components/ErrorState";
import QrUploadField from "../../components/admin/QrUploadField";
import { Button, Card, Field, Input, Skeleton } from "../../components/ui";
import {
  useAdminPaymentConfig,
  useUpdatePaymentConfig,
} from "../../hooks/useAdminSettings";
import {
  paymentConfigFormSchema,
  type PaymentConfigFormValues,
} from "../../schemas/paymentConfigSchema";
import { formatDateTime } from "../../utils/time";

const EMPTY: PaymentConfigFormValues = {
  methodLabel: "eSewa",
  recipientName: "",
  whatsappNumber: "",
  instructions: "",
  qrImageUrl: "",
};

export default function AdminPaymentSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useAdminPaymentConfig();
  const update = useUpdatePaymentConfig();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<PaymentConfigFormValues>({
    resolver: zodResolver(paymentConfigFormSchema),
    defaultValues: EMPTY,
    values: data
      ? {
          methodLabel: data.methodLabel,
          recipientName: data.recipientName,
          whatsappNumber: data.whatsappNumber,
          instructions: data.instructions,
          qrImageUrl: data.qrImageUrl,
        }
      : undefined,
  });

  const qrImageUrl = useWatch({ control, name: "qrImageUrl" });

  const onSubmit = (values: PaymentConfigFormValues) =>
    update.mutate(values, {
      onSuccess: () => toast.success("Payment details saved"),
      onError: (err) => toast.error(err.message),
    });

  if (isLoading) return <Skeleton className="h-96 max-w-2xl" />;
  if (isError)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Payment details</h1>
        <p className="mt-1 text-sm text-secondary">
          Customers see this on the checkout page. Every change is recorded in
          the audit log.
          {data && ` Last updated ${formatDateTime(data.updatedAt)}.`}
        </p>
      </div>

      <div className="rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
        Changing the QR changes where customers send money. After saving, scan
        the new QR from the screen with your phone and check the recipient name
        before taking orders.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Payment method name"
              error={errors.methodLabel?.message}
            >
              <Input {...register("methodLabel")} />
            </Field>
            <Field
              label="Recipient name"
              error={errors.recipientName?.message}
              hint="Shown to customers next to the QR."
            >
              <Input {...register("recipientName")} />
            </Field>
            <Field
              label="WhatsApp number"
              error={errors.whatsappNumber?.message}
              hint="Digits only, with country code, e.g. 9779767485432"
            >
              <Input inputMode="numeric" {...register("whatsappNumber")} />
            </Field>
          </div>
          <Field
            label="Payment instructions"
            error={errors.instructions?.message}
            hint="One step per line."
          >
            <textarea
              rows={5}
              maxLength={1000}
              className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-fg focus:border-primary"
              {...register("instructions")}
            />
          </Field>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-display text-white font-semibold">QR code</h2>
          <QrUploadField
            currentUrl={qrImageUrl}
            onUploaded={(url) =>
              setValue("qrImageUrl", url, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {errors.qrImageUrl?.message && (
            <p role="alert" className="text-xs text-danger">
              {errors.qrImageUrl.message}
            </p>
          )}
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            Save payment details
          </Button>
        </div>
      </form>
    </div>
  );
}
