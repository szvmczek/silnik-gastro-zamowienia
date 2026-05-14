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
import { Kicker } from "@/shared/components/typography/Kicker";
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
  const restaurantName = settings.data?.name ?? "Pizza Demo";
  const tagline = settings.data?.tagline ?? "Smacznie i szybko";
  const city = settings.data?.city ?? null;

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

  const initialLetter = restaurantName.charAt(0).toUpperCase();

  return (
    <div className="grid min-h-screen bg-[rgb(var(--color-bg-page))] lg:grid-cols-[5fr_7fr]">
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-[rgb(var(--color-bg-dark))] p-12 text-[rgb(var(--color-text-on-dark))] lg:flex"
        aria-hidden="true"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[rgb(var(--color-primary))] font-serif text-[20px] font-bold text-white">
            {initialLetter}
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">{restaurantName}</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgb(var(--color-text-faint))]">
              Panel admina
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-[380px]">
          {city && (
            <Kicker className="mb-3 block text-[rgb(var(--color-accent-yellow))]">
              {city}
            </Kicker>
          )}
          <h2 className="font-sans text-[44px] font-extrabold leading-[1.05] tracking-[-0.02em] text-[rgb(var(--color-bg-page))]">
            {tagline}
            <span className="text-[rgb(var(--color-primary))]">.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-[1.55] text-[rgb(var(--color-text-on-dark))]/80">
            Zarządzanie zamówieniami, menu i godzinami otwarcia w&nbsp;jednym miejscu.
          </p>
        </div>

        <div className="relative z-10 text-[12px] text-[rgb(var(--color-text-faint))]">
          Single-tenant · {restaurantName}
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-[380px]">
          <Kicker className="mb-3 block">Zaloguj się</Kicker>
          <h1 className="text-[30px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[rgb(var(--color-text-primary))]">
            Witaj z&nbsp;powrotem
            <span className="text-[rgb(var(--color-primary))]">.</span>
          </h1>

          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="mt-8 space-y-5"
            noValidate
          >
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                size="lg"
                disabled={mutation.isPending}
                error={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-[rgb(var(--status-cancelled))]">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                size="lg"
                disabled={mutation.isPending}
                error={Boolean(errors.password)}
                className="font-mono"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1.5 text-[12px] text-[rgb(var(--status-cancelled))]">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="xl"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logowanie…" : "Zaloguj"}
            </Button>
          </form>

          <div className="mt-9 border-t border-[rgb(var(--color-border-subtle))] pt-6 text-center text-[12px] text-[rgb(var(--color-text-muted))]">
            Tylko dla uprawnionych pracowników.
            <br />
            <Link
              to="/"
              className="mt-1 inline-block font-medium text-[rgb(var(--color-text-body))] transition-colors hover:text-[rgb(var(--color-primary))]"
            >
              ← Wróć na stronę
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
