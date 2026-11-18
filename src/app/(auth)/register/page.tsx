import { RegisterForm } from "@/components/auth/register-form";
import { safeRedirectTo } from "@/lib/redirect";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return <RegisterForm redirectTo={safeRedirectTo(params.next)} />;
}
