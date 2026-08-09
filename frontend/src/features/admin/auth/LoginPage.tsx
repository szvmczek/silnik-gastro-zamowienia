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
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { PiecField, PiecInput } from "@/features/public/checkout/components/PiecField";
import { PiecButton } from "@/features/public/shared/PiecButton";

const schema = z.object({
  email: z.string().min(1, "Email jest wymagany").email("Nieprawidłowy email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

type FormValues = z.infer<typeof schema>;

interface LocationState {
  from?: Location;
}

/**
 * D-08: panel admina zostaje bez zmian w tej rundzie — z wyjątkiem tego
 * ekranu. To pierwsze, co zobaczy właściciel pizzerii przy demo, więc
 * dostaje tokeny wizualne z design v3.
 *
 * Zmieniona jest WYŁĄCZNIE warstwa wizualna. Schemat Zod, mutacja,
 * setSession, redirect z location.state i obsługa błędów przez
 * extractProblem — bez jednej zmiany.
 *
 * Ciemne tokeny ustawiamy lokalnym efektem (nie przez PublicLayout,
 * bo /admin/login nie leży pod publicznymi route'ami) i zdejmujemy przy
 * odmontowaniu, żeby po zalogowaniu panel wrócił na jasny motyw.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setSession } = useAuth();
  const settings = usePublicSettings();
  const restaurantName = settings.data?.name ?? "";
  const tagline = settings.data?.tagline ?? null;

  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/admin";

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-public-theme", "piec");
    return () => root.removeAttribute("data-public-theme");
  }, []);

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
    <div className="flex min-h-screen items-center justify-center bg-piec-bg px-5 py-10 text-piec-ink">
      <div className="w-full max-w-[380px]">
        <Link to="/" className="flex min-h-[44px] items-center font-display text-[22px] tracking-[3px]">
          {restaurantName}
        </Link>

        <h1 className="mt-6 font-display text-[clamp(34px,9vw,44px)] tracking-[1.5px]">
          Panel
        </h1>
        <p className="mt-1 text-sm leading-[1.6] text-piec-ink/60">
          {tagline ?? "Zamówienia, menu i godziny otwarcia w jednym miejscu."}
        </p>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="mt-7 space-y-4"
          noValidate
        >
          <PiecField label="E-mail" error={errors.email?.message}>
            <PiecInput
              id="email"
              type="email"
              autoComplete="email"
              disabled={mutation.isPending}
              invalid={Boolean(errors.email)}
              {...register("email")}
            />
          </PiecField>

          <PiecField label="Hasło" error={errors.password?.message}>
            <PiecInput
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={mutation.isPending}
              invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </PiecField>

          <PiecButton type="submit" fullWidth height={56} disabled={mutation.isPending}>
            {mutation.isPending ? "Logowanie…" : "ZALOGUJ"}
          </PiecButton>
        </form>

        <div className="mt-8 border-t border-piec-ink/10 pt-5 text-center text-[13px] text-piec-ink/50">
          Tylko dla uprawnionych pracowników.
          <br />
          <Link
            to="/"
            className="mt-1 inline-flex min-h-[44px] items-center font-semibold text-piec-ink/70 transition-colors hover:text-primary"
          >
            ← Wróć na stronę
          </Link>
        </div>
      </div>
    </div>
  );
}
