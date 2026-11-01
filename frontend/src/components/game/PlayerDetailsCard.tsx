import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Field, Input } from "../ui";
import type { PlayerField } from "../../types/game";
import type { PlayerFormValues } from "../../utils/playerSchema";

interface PlayerDetailsCardProps {
  fields: PlayerField[];
  register: UseFormRegister<PlayerFormValues>;
  errors: FieldErrors<PlayerFormValues>;
  disabled: boolean;
}

export default function PlayerDetailsCard({
  fields,
  register,
  errors,
  disabled,
}: PlayerDetailsCardProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const isPassword = field.key === "password";
        return (
          <div
            key={field.key}
            className={fields.length === 1 ? "sm:col-span-2" : undefined}
          >
            <Field
              label={field.label}
              hint={field.helpText ?? undefined}
              error={errors[field.key]?.message as string | undefined}
            >
              <Input
                type={isPassword ? "password" : "text"}
                disabled={disabled}
                autoComplete={isPassword ? "new-password" : "off"}
                inputMode={
                  field.ruleType === "digits"
                    ? "numeric"
                    : field.ruleType === "email"
                      ? "email"
                      : "text"
                }
                placeholder={field.placeholder ?? undefined}
                {...register(field.key)}
              />
            </Field>
          </div>
        );
      })}
    </div>
  );
}
