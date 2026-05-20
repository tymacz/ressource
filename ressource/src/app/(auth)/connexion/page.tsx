import SignInPage from "./form-signin";

export default async function SignIn() {
  return (
    <div className="flex min-h-screen flex-row items-center justify-between bg-gray-50">
      <div className="flex w-full flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold">Bienvenue</h1>
        <p className="mt-2 mb-8 text-gray-500">Connectez-vous à votre compte</p>
        <SignInPage />
      </div>
    </div>
  );
}
