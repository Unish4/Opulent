import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Skeleton,
} from "../../components/ui";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  useInviteMember,
  useRevokeInvite,
  useSetMemberRole,
  useTeam,
} from "../../hooks/useAdminTeam";
import { inviteSchema, type InviteFormValues } from "../../schemas/teamSchema";
import type { CurrentUser, UserRole } from "../../types/user";

interface PendingChange {
  member: CurrentUser;
  role: UserRole;
}

export default function AdminTeamPage() {
  const { data: me } = useCurrentUser();
  const { data, isLoading, isError, error, refetch } = useTeam();
  const invite = useInviteMember();
  const revoke = useRevokeInvite();
  const setRole = useSetMemberRole();
  const [pending, setPending] = useState<PendingChange | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "operator" },
  });

  const onInvite = (values: InviteFormValues) => {
    invite.mutate(values, {
      onSuccess: (result) => {
        toast.success(
          result.kind === "promoted"
            ? "Existing account promoted."
            : "Invite saved. They get access when they sign up with this email.",
        );
        reset();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const confirmChange = () => {
    if (!pending) return;
    setRole.mutate(
      { userId: pending.member.id, role: pending.role },
      {
        onSuccess: () => {
          toast.success("Role updated");
          setPending(null);
        },
        onError: (err) => {
          toast.error(err.message);
          setPending(null);
        },
      },
    );
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Team</h1>
        <p className="mt-1 text-sm text-secondary">
          Owners manage everything. Operators handle orders but cannot change
          prices, payment settings or this team list.
        </p>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-base font-semibold">
          Add a team member
        </h2>
        <form
          onSubmit={handleSubmit(onInvite)}
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px_auto]"
          noValidate
        >
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="off"
              placeholder="name@example.com"
              {...register("email")}
            />
          </Field>
          <Field label="Role">
            <Select {...register("role")}>
              <option value="operator">Operator</option>
              <option value="owner">Owner</option>
            </Select>
          </Field>
          <Button
            type="submit"
            className="sm:mt-[26px]"
            loading={invite.isPending}
          >
            Add
          </Button>
        </form>
      </Card>

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      )}
      {isError && (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      )}

      {data && (
        <>
          <section className="space-y-3">
            <h2 className="font-display text-base font-semibold">Members</h2>
            {data.members.map((member) => {
              const isMe = member.id === me?.id;
              return (
                <Card
                  key={member.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {member.name}{" "}
                      {isMe && (
                        <span className="text-xs text-muted">(you)</span>
                      )}
                    </p>
                    <p className="truncate text-sm text-secondary">
                      {member.email}
                    </p>
                  </div>
                  <Badge tone={member.role === "owner" ? "amber" : "primary"}>
                    {member.role}
                  </Badge>
                  <Select
                    aria-label={`Change role for ${member.name}`}
                    className="h-9 w-40"
                    value={member.role}
                    disabled={isMe}
                    onChange={(e) =>
                      setPending({ member, role: e.target.value as UserRole })
                    }
                  >
                    <option value="operator">Operator</option>
                    <option value="owner">Owner</option>
                    <option value="customer">Remove admin access</option>
                  </Select>
                </Card>
              );
            })}
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-base font-semibold">
              Pending invites
            </h2>
            {data.invites.length === 0 ? (
              <EmptyState title="No pending invites" />
            ) : (
              data.invites.map((item) => (
                <Card key={item.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.email}</p>
                    <p className="text-sm text-secondary">
                      Waiting for sign-up
                    </p>
                  </div>
                  <Badge>{item.role}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={revoke.isPending && revoke.variables === item.id}
                    onClick={() =>
                      revoke.mutate(item.id, {
                        onSuccess: () => toast.success("Invite revoked"),
                        onError: (err) => toast.error(err.message),
                      })
                    }
                  >
                    Revoke
                  </Button>
                </Card>
              ))
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={!!pending}
        tone={pending?.role === "customer" ? "danger" : "primary"}
        title="Change role?"
        description={
          pending
            ? pending.role === "customer"
              ? `${pending.member.name} will lose all admin access.`
              : `${pending.member.name} will become ${pending.role === "owner" ? "an owner" : "an operator"}.`
            : ""
        }
        confirmLabel="Change role"
        loading={setRole.isPending}
        onConfirm={confirmChange}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
