import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mx-auto">Login to your account</CardTitle>
          <CardDescription className="text-base mx-auto">
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup className="gap-8">
              <Field className="gap-1">
                <FieldLabel htmlFor="email" className="text-sm">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="haven@example.com"
                  className="h-9"
                  required
                />
              </Field>
              <Field className="gap-1">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-sm">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-9"
                  required
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="text-base h-9">
                  Login
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="text-base h-9"
                >
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
