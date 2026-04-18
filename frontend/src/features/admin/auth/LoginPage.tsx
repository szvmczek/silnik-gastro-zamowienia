import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { login } from "@/shared/api/authApi";
import { extractProblem } from "@/shared/api/client";
import { useAuth } from "@/shared/auth/useAuth";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Panel administratora</CardTitle>
          <CardDescription>Zaloguj się, aby zarządzać restauracją.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={mutation.isPending}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={mutation.isPending}
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logowanie…" : "Zaloguj się"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
