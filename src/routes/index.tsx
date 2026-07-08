import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Eye, EyeOff, Droplet } from "lucide-react";
import { ParticleGlobe } from "@/components/ParticleGlobe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — Capgemini" },
      { name: "description", content: "Sign in to your Capgemini account to access your workspace." },
      { property: "og:title", content: "Sign In — Capgemini" },
      { property: "og:description", content: "Sign in to your Capgemini account to access your workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignInPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(128),
});
type FormValues = z.infer<typeof schema>;

function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    // Placeholder auth submission
    await new Promise((r) => setTimeout(r, 700));
    console.log("Sign in:", values.email);
    setSubmitting(false);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-space">
      {/* Deep gradient base */}
      <div className="pointer-events-none absolute inset-0 bg-space-gradient" />

      {/* 3D globe layer — bleeds off the left edge */}
      <div className="pointer-events-none absolute inset-y-0 left-[-18%] w-[85%] md:w-[70%] lg:w-[62%]">
        <ParticleGlobe />
      </div>

      {/* Horizontal nebula flare from right side of globe toward form */}
      <div className="pointer-events-none absolute inset-y-0 left-[18%] w-[70%] bg-nebula-flare mix-blend-screen" />

      {/* Content grid */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:block" />

        <div className="flex items-center justify-center px-6 py-16 sm:px-10 lg:px-16">
          <div className="glass-card w-full max-w-md rounded-3xl p-8 sm:p-10">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center">
                <Droplet
                  className="h-12 w-12 text-brand"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            </div>

            {/* Header */}
            <div className="mt-3 flex flex-col items-center">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Sign In
              </h1>
              <span className="mt-2 h-[3px] w-10 rounded-full bg-brand" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-semibold tracking-[0.14em] text-slate-500"
                >
                  EMAIL
                </label>
                <div className="field-wrap">
                  <Mail className="field-icon" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="field-input pl-10"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-semibold tracking-[0.14em] text-slate-500"
                >
                  PASSWORD
                </label>
                <div className="field-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="field-input pr-10"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors hover:text-brand"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-signin mt-2 w-full"
              >
                {submitting ? "Signing In…" : "Sign In"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-medium tracking-[0.2em] text-slate-400">
                  OR
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <a href="#" className="font-semibold text-brand hover:text-brand-glow">
                  Register
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
