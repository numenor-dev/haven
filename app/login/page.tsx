import { Suspense } from "react"
import { LoginForm } from "@/components/landing/login/LoginForm"

export default function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
