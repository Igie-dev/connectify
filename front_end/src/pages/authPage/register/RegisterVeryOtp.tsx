import { FormEvent, useEffect, useRef, useState } from "react";
import BtnLoader from "@/components/loader/BtnLoader";
import { useNavigate } from "react-router-dom";
import ResendOtp from "./ResendOtp";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/service/slices/auth/authApiSlice";
import { decryptText } from "@/utils/helper";
import { Input } from "@/components/ui/input";
export default function VerifyOtp() {
  const [register, { isLoading, isError, error }] = useRegisterMutation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputOtp, setInputOtp] = useState("");
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("userName");
  const email = sessionStorage.getItem("email");
  const password = sessionStorage.getItem("password");

  useEffect(() => {
    if (!userName || !email || !password) {
      navigate("/register/form");
    }
  }, [email, userName, navigate, password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userName || !email || !password) {
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await register({
        otp: inputOtp,
        userName,
        email,
        password: decryptText(decodeURIComponent(password)),
      });

      if (res?.data?.email) {
        sessionStorage.removeItem("userName");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("password");
        navigate("/login");
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}
  };

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  const navigateBack = () => {
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("password");
    navigate("/register/form");
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[30rem] flex flex-col gap-5 md:border rounded-md py-10"
    >
      <header className="flex flex-col items-center w-full">
        <div className="text-lg font-semibold lg:text-3xl">
          <p>Email Verification</p>
        </div>
        <div className="flex flex-col items-center my-5 text-xs text-gray-400 lg:text-sm">
          <p className="font-normal">We have sent a code to your email</p>
          <p className="p-2 my-4 font-medium rounded-md bg-secondary">
            {email}
          </p>
        </div>
        {isError ? (
          <p className="text-sm text-destructive">{error?.data?.error}</p>
        ) : null}
      </header>
      <main className="flex flex-col items-center w-full gap-8">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter your Otp"
          value={inputOtp || ""}
          onChange={(e) => setInputOtp(e.target.value)}
          className="w-[14rem] h-11 outline-none   text-center  text-sm  rounded-lg  border-2 bg-secondary focus:border-primary/70"
        />
        <ResendOtp email={email as string} userName={userName as string} />
        <Button variant="link" onClick={navigateBack}>
          Try again
        </Button>
        <Button
          type="submit"
          title="Subit Otp"
          size="lg"
          disabled={isLoading}
          className="w-[80%] h-10  rounded-md"
        >
          {isLoading ? <BtnLoader /> : "Submit"}
        </Button>
      </main>
    </form>
  );
}
