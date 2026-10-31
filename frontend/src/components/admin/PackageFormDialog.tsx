import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Field, Input, Select } from "../ui";
import {
  packageFormSchema,
  type PackageFormValues,
} from "../../schemas/packageSchema";
import { paisaToRupeeString } from "../../utils/money";
import type { AdminPackage, PackagePayload } from "../../types/package";

interface PackageFormDialogProps {
  initial: AdminPackage | null;
  groups: string[];
  loading: boolean;
  onSubmit: (payload: PackagePayload) => void;
  onClose: () => void;
}

export default function PackageFormDialog({
  initial,
  groups,
  loading,
  onSubmit,
  onClose,
}: PackageFormDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: initial
      ? {
          group: initial.group,
          name: initial.name,
          type: initial.type,
          priceNpr: paisaToRupeeString(initial.pricePaisa),
          costNpr:
            initial.costPaisa === null
              ? ""
              : paisaToRupeeString(initial.costPaisa),
          description: initial.description ?? "",
          badge: initial.badge ?? "",
          sortOrder: String(initial.sortOrder),
        }
      : {
          group: groups[0] ?? "",
          name: "",
          type: "topup",
          priceNpr: "",
          costNpr: "",
          description: "",
          badge: "",
          sortOrder: "0",
        },
  });

  const submit = (values: PackageFormValues) =>
    onSubmit({
      group: values.group,
      name: values.name,
      type: values.type,
      priceNpr: Number(values.priceNpr),
      costNpr: values.costNpr === "" ? null : Number(values.costNpr),
      description: values.description,
      badge: values.badge,
      sortOrder: Number(values.sortOrder),
    });

  return (
    <Dialog.Root open onOpenChange={(next) => !next && !loading && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line bg-surface p-6 shadow-2xl">
          <Dialog.Title className="font-display text-lg font-semibold">
            {initial ? "Edit package" : "Add package"}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-secondary">
            Price changes apply to new orders only.
          </Dialog.Description>

          <form
            onSubmit={handleSubmit(submit)}
            className="mt-5 grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <Field label="Group" error={errors.group?.message}>
              <Input
                list="package-groups"
                placeholder="e.g. Diamonds"
                {...register("group")}
              />
              <datalist id="package-groups">
                {groups.map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
            </Field>
            <Field label="Type" error={errors.type?.message}>
              <Select {...register("type")}>
                <option value="topup">Top-up</option>
                <option value="pass">Pass / subscription</option>
                <option value="bundle">Bundle</option>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Name" error={errors.name?.message}>
                <Input placeholder="e.g. 55 Diamonds" {...register("name")} />
              </Field>
            </div>
            <Field label="Selling price (Rs)" error={errors.priceNpr?.message}>
              <Input inputMode="decimal" {...register("priceNpr")} />
            </Field>
            <Field
              label="Distributor cost (Rs)"
              error={errors.costNpr?.message}
              hint="Optional. Never shown to customers."
            >
              <Input inputMode="decimal" {...register("costNpr")} />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Note"
                error={errors.description?.message}
                hint="Small text under the name, e.g. 3 free coins included."
              >
                <Input {...register("description")} />
              </Field>
            </div>
            <Field
              label="Badge"
              error={errors.badge?.message}
              hint="Optional, e.g. Popular."
            >
              <Input {...register("badge")} />
            </Field>
            <Field label="Sort order" error={errors.sortOrder?.message}>
              <Input inputMode="numeric" {...register("sortOrder")} />
            </Field>

            <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {initial ? "Save changes" : "Add package"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
