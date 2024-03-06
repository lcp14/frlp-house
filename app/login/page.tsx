import GoogleLoginButton from "./components/GoogleProvider";

export default async function Login() {
  return (
    <div className="m-0 flex h-full w-full flex-col items-center justify-center space-y-2">
      <h1 className="mt-4 flex-grow text-xl font-semibold">
        FRLP - House Manager
      </h1>
      <div className="flex h-1/2 flex-col items-center">
        <GoogleLoginButton />. . .
        <span className="text-xs font-extralight">
          {" "}
          Other providers yet to come
        </span>
      </div>
    </div>
  );
}
