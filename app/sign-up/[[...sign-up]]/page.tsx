import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "border-2 border-ink shadow-[4px_4px_0px_#2D2D2D] rounded-xl",
            headerTitle: "text-ink font-display",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton: "border-2 border-ink hover:bg-sakura-light",
            formButtonPrimary: "bg-sakura-pink border-2 border-ink shadow-[2px_2px_0px_#2D2D2D] hover:shadow-[4px_4px_0px_#2D2D2D] text-ink font-medium",
            footerActionLink: "text-plum-dark hover:text-ink",
          }
        }}
        afterSignUpUrl="/onboarding"
        signInUrl="/sign-in"
      />
    </div>
  )
}
