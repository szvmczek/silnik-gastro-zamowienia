import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { login } from "@/shared/api/authApi";
import { extractProblem } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/useAuth";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";

const schema = z.object({
  email: z.string().min(1, "Email jest wymagany").email("Nieprawidłowy email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

type FormValues = z.infer<typeof schema>;

interface LocationState {
  from?: Location;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setSession } = useAuth();
  const settings = usePublicSettings();
  const restaurantName = settings.data?.name ?? "Panel";

  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/admin";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data);
      toast.success(`Witaj, ${data.user.displayName}`);
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      const problem = extractProblem(error);
      const message =
        problem?.detail ??
        problem?.title ??
        "Logowanie nie powiodło się. Sprawdź dane i spróbuj ponownie.";
      toast.error(message);
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Panel administracyjny
          </div>
          <div className="mt-1 truncate text-[24px] font-semibold tracking-tight text-slate-900">
            {restaurantName}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900">
            Zaloguj się
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Panel dostępny dla uprawnionych pracowników.
          </p>

          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="mt-6 space-y-4"
            noValidate
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={mutation.isPending}
                error={Boolean(errors.email)}
                className="h-11"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-rose-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={mutation.isPending}
                error={Boolean(errors.password)}
                className="h-11"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-[12px] text-rose-600">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logowanie…" : "Zaloguj się"}
            </Button>
          </form>
        </div>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-[12px] text-slate-400 transition-colors hover:text-slate-700"
          >
            ← Wróć na stronę
          </Link>
        </div>
      </div>
    </div>
  );
}
