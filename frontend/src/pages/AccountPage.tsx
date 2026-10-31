import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ErrorState from "../components/ErrorState";
import { Badge, Button, Card, Field, Input, Skeleton } from "../components/ui";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profileSchema";
import { isAdminRole } from "../types/user";
import { Link } from "react-router";

export default function AccountPage() {
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name, phone: user.phone ?? "" } : undefined,
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(values, {
      onSuccess: () => toast.success("Profile updated"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold">My account</h1>
      <Link
        to="/account/orders"
        className="mt-2 inline-block text-sm font-medium text-primary-hover hover:underline"
      >
        View my orders
      </Link>

      <Card className="mt-6 p-5 sm:p-6">
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        )}

        {isError && (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}

        {user && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Field label="Email">
              <Input
                value={user.email || "No email on this account"}
                disabled
                readOnly
              />
            </Field>
            <Field label="Name" error={errors.name?.message}>
              <Input autoComplete="name" {...register("name")} />
            </Field>
            <Field
              label="Mobile number"
              error={errors.phone?.message}
              hint="Used by our team to reach you about an order."
            >
              <Input
                inputMode="tel"
                autoComplete="tel"
                placeholder="98XXXXXXXX"
                {...register("phone")}
              />
            </Field>

            {isAdminRole(user.role) && (
              <p className="flex items-center gap-2 text-sm text-secondary">
                Role: <Badge tone="primary">{user.role}</Badge>
              </p>
            )}

            <Button
              type="submit"
              loading={updateProfile.isPending}
              disabled={!isDirty}
            >
              Save changes
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
