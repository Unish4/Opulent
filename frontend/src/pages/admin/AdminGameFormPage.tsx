import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import ErrorState from "../../components/ErrorState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ImageUploadField from "../../components/admin/ImageUploadField";
import { Button, Card, Field, Input, Select } from "../../components/ui";
import {
  useAdminGame,
  useCreateGame,
  useUpdateGame,
  type UploadedImage,
} from "../../hooks/useAdminGames";
import { gameFormSchema, type GameFormValues } from "../../schemas/gameSchema";
import type { AdminGame, GamePayload } from "../../types/game";
import { slugify } from "../../utils/slugify";

const NEW_FIELD: GameFormValues["playerFields"][number] = {
  key: "playerId",
  label: "Player ID",
  placeholder: "",
  helpText: "",
  required: true,
  ruleType: "digits",
  minLength: 5,
  maxLength: 20,
};

const EMPTY: GameFormValues = {
  name: "",
  slug: "",
  aliases: "",
  publisher: "",
  description: "",
  instructions: "",
  playerFields: [NEW_FIELD],
  lookupEnabled: false,
  providerGameCode: "",
  isPublished: false,
  isFeatured: false,
  sortOrder: 0,
};

const toFormValues = (game: AdminGame): GameFormValues => ({
  name: game.name,
  slug: game.slug,
  aliases: game.aliases.join(", "),
  publisher: game.publisher ?? "",
  description: game.description ?? "",
  instructions: game.instructions ?? "",
  playerFields: game.playerFields.map((field) => ({
    key: field.key,
    label: field.label,
    placeholder: field.placeholder ?? "",
    helpText: field.helpText ?? "",
    required: field.required,
    ruleType: field.ruleType,
    minLength: field.minLength,
    maxLength: field.maxLength,
  })),
  lookupEnabled: game.lookup.enabled,
  providerGameCode: game.lookup.providerGameCode ?? "",
  isPublished: game.isPublished,
  isFeatured: game.isFeatured,
  sortOrder: game.sortOrder,
});

const toPayload = (
  values: GameFormValues,
  image: UploadedImage | null,
  includeSlug: boolean,
): GamePayload => ({
  name: values.name,
  ...(includeSlug ? { slug: values.slug } : {}),
  aliases: values.aliases
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
  publisher: values.publisher,
  description: values.description,
  instructions: values.instructions,
  playerFields: values.playerFields,
  lookup: {
    enabled: values.lookupEnabled,
    providerGameCode: values.providerGameCode,
  },
  isPublished: values.isPublished,
  isFeatured: values.isFeatured,
  sortOrder: values.sortOrder,
  ...(image ? { imageUrl: image.url, imagePublicId: image.publicId } : {}),
});

export default function AdminGameFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const { data: game, isLoading, isError, error, refetch } = useAdminGame(id);
  const createGame = useCreateGame();
  const updateGame = useUpdateGame(id);
  const [uploaded, setUploaded] = useState<UploadedImage | null>(null);

  const formValues = useMemo(
    () => (game ? toFormValues(game) : undefined),
    [game],
  );

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,

    formState: { errors },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: EMPTY,
    values: formValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "playerFields",
  });
  const lookupEnabled = useWatch({ control, name: "lookupEnabled" });
  const nameValue = useWatch({ control, name: "name" });
  const currentImage = uploaded?.url ?? game?.imageUrl ?? null;

  const onSubmit = (values: GameFormValues) => {
    if (isNew) {
      createGame.mutate(toPayload(values, uploaded, true), {
        onSuccess: (created) => {
          toast.success("Game created");
          navigate(`/admin/games/${created.id}`, { replace: true });
        },
        onError: (err) => toast.error(err.message),
      });
      return;
    }
    updateGame.mutate(toPayload(values, uploaded, false), {
      onSuccess: () => {
        setUploaded(null);
        toast.success("Game saved successfully");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const onInvalid = (formErrors: typeof errors) => {
    const firstKey = Object.keys(formErrors)[0];
    const firstErr = firstKey
      ? (formErrors as Record<string, any>)[firstKey]
      : null;
    const msg =
      firstErr?.message ||
      firstErr?.root?.message ||
      "Please check the form for errors before saving.";
    toast.error(typeof msg === "string" ? msg : "Validation error");
  };

  if (!isNew && isLoading) return <LoadingSpinner />;
  if (!isNew && isError)
    return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const saving = createGame.isPending || updateGame.isPending;

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/admin/games"
        className="inline-flex items-center gap-1 text-sm text-secondary hover:text-fg"
      >
        <ArrowLeft size={16} /> All games
      </Link>
      <h1 className="font-display text-2xl font-bold">
        {isNew ? "New game" : `Edit ${game?.name ?? "game"}`}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
        noValidate
      >
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-white font-semibold">Basics</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <Input
                {...register("name", {
                  onBlur: (event) => {
                    if (isNew && !getValues("slug"))
                      setValue("slug", slugify(event.target.value));
                  },
                })}
              />
            </Field>
            <Field
              label="Slug"
              error={errors.slug?.message}
              hint={
                isNew
                  ? "Used in the page address. Cannot be changed later."
                  : "Fixed after creation."
              }
            >
              <Input disabled={!isNew} {...register("slug")} />
            </Field>
            <Field label="Publisher" error={errors.publisher?.message}>
              <Input {...register("publisher")} />
            </Field>
            <Field
              label="Search aliases"
              error={errors.aliases?.message}
              hint="Comma separated, e.g. ff, freefire"
            >
              <Input {...register("aliases")} />
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <Input {...register("description")} />
          </Field>
          <Field
            label="Where to find the player details"
            error={errors.instructions?.message}
          >
            <textarea
              rows={3}
              className="w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-fg focus:border-primary"
              {...register("instructions")}
            />
          </Field>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-display text-white font-semibold">Artwork</h2>
          <ImageUploadField
            name={nameValue}
            currentUrl={currentImage}
            onUploaded={setUploaded}
          />
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-white font-semibold">
              Player details to collect
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append(NEW_FIELD)}
              disabled={fields.length >= 5}
            >
              <Plus size={14} /> Add field
            </Button>
          </div>
          {errors.playerFields?.message && (
            <p role="alert" className="text-xs text-danger">
              {errors.playerFields.message}
            </p>
          )}
          {errors.playerFields?.root?.message && (
            <p role="alert" className="text-xs text-danger">
              {errors.playerFields.root.message}
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded-lg border border-line p-4 sm:grid-cols-6"
            >
              <div className="sm:col-span-2">
                <Field label="Field type">
                  <Select {...register(`playerFields.${index}.key`)}>
                    <option value="playerId">Player ID</option>
                    <option value="serverId">Server ID</option>
                    <option value="playerName">Player name</option>
                    <option value="email">Email</option>
                    <option value="login">Login (username or email)</option>
                    <option value="password">Password</option>
                  </Select>
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Label"
                  error={errors.playerFields?.[index]?.label?.message}
                >
                  <Input {...register(`playerFields.${index}.label`)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Format">
                  <Select {...register(`playerFields.${index}.ruleType`)}>
                    <option value="digits">Numbers only</option>
                    <option value="alphanumeric">Letters and numbers</option>
                    <option value="text">Any text</option>
                    <option value="email">Email</option>
                    <option value="password">Password (masked)</option>
                  </Select>
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field label="Placeholder">
                  <Input {...register(`playerFields.${index}.placeholder`)} />
                </Field>
              </div>
              <div className="sm:col-span-3">
                <Field label="Help text">
                  <Input {...register(`playerFields.${index}.helpText`)} />
                </Field>
              </div>
              <Field
                label="Min length"
                error={errors.playerFields?.[index]?.minLength?.message}
              >
                <Input
                  type="number"
                  {...register(`playerFields.${index}.minLength`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>
              <Field
                label="Max length"
                error={errors.playerFields?.[index]?.maxLength?.message}
              >
                <Input
                  type="number"
                  {...register(`playerFields.${index}.maxLength`, {
                    valueAsNumber: true,
                  })}
                />
              </Field>
              <label className="flex items-center gap-2 self-end pb-3 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  {...register(`playerFields.${index}.required`)}
                />
                Required
              </label>
              <div className="flex items-end justify-end sm:col-span-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  aria-label="Remove field"
                >
                  <Trash2 size={15} /> Remove
                </Button>
              </div>
            </div>
          ))}
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-display text-white font-semibold">
            Player lookup
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("lookupEnabled")}
            />
            Turn on player lookup for this game
          </label>
          {lookupEnabled && (
            <Field
              label="Provider game code"
              error={errors.providerGameCode?.message}
              hint="The exact game slug from the lookup provider's documentation."
            >
              <Input {...register("providerGameCode")} />
            </Field>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-display text-white font-semibold">Visibility</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("isPublished")}
            />
            Published (visible to customers)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("isFeatured")}
            />
            Featured on the home page
          </label>
          <div className="max-w-40">
            <Field label="Sort order" error={errors.sortOrder?.message}>
              <Input
                type="number"
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {uploaded && (
            <span className="text-xs font-medium text-amber">
              Artwork uploaded (unsaved)
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/games")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isNew ? "Create game" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
