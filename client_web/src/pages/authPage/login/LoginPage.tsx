import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { Eye, EyeOff, AtSign } from "lucide-react";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useSignInMutation } from "@/service/slices/auth/authApiSlice";
import { Button } from "@/components/ui/button";
import BtnLoader from "@/components/loader/BtnLoader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function LoginPage() {
  const navigate = useNavigate();
  const [isOpenEye, setIsOpenEye] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [signin, { isLoading, error }] = useSignInMutation();

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: new Yup.ObjectSchema({
      email: Yup.string().required("Email is required!"),
      password: Yup.string().required("Password is required!"),
    }),
    onSubmit: async (values) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await signin({
          email: values.email,
          password: values.password,
        });

        if (res?.data?.accessToken) {
          navigate("/c");
        }
        // eslint-disable-next-line no-empty
      } catch (error) {}
    },
  });
  return (
    <section className="flex items-center justify-center w-screen h-screen">
      <form
        onSubmit={formik.handleSubmit}
        className="w-full max-w-[35rem] flex flex-col items-center gap-5  px-2 pb-5  md:px-5 md:pb-10 md:border rounded-md"
      >
        <div className="flex justify-start w-full mt-5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate("/")}
            type="button"
            className=""
          >
            Back to home
          </Button>
        </div>

        <h1 className="mt-5 text-2xl font-bold">Welcome to Connectify</h1>
        <h3 className="text-lg font-semibold">Log In</h3>
        <p className="my-2 text-sm text-destructive">{error?.data?.error}</p>
        <main className="flex flex-col items-start w-full gap-2">
          <div className="relative w-[95%] flex flex-col pb-4  pl-4 ">
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              ref={inputRef}
              type="text"
              id="email"
              autoComplete="false"
              placeholder="Enter your email"
              value={formik.values.email || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full h-11 outline-none pl-2 pr-10  bg-transparent text-sm border rounded-lg ${
                formik.touched.email && formik.errors.email
                  ? "border-destructive"
                  : "border-border"
              }  `}
            />
            <span className="absolute p-2 right-1 bottom-5">
              <AtSign className="w-5 h-5" />
            </span>
            <p className="absolute text-xs -bottom-1 left-5 text-destructive">
              {formik.touched.email && formik.errors.email
                ? formik.errors.email
                : null}
            </p>
          </div>
          <div className="relative w-[95%] flex flex-col  pb-4  pl-4 ">
            <Label htmlFor="password" className="text-sm font-semibold">
              Password
            </Label>
            <Input
              type={isOpenEye ? "text" : "password"}
              id="password"
              autoComplete="false"
              placeholder="Enter your password"
              value={formik.values.password || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full h-11 outline-none pl-2 pr-10  text-sm bg-transparent  border rounded-lg ${
                formik.touched.password && formik.errors.password
                  ? "border-destructive"
                  : "border-border"
              }   `}
            />
            <button
              type="button"
              onClick={() => setIsOpenEye((prev) => !prev)}
              className="absolute p-2 right-1 bottom-5"
            >
              {isOpenEye ? (
                <Eye className="w-5 h-5 pointer-events-none" />
              ) : (
                <EyeOff className="w-5 h-5 pointer-events-none" />
              )}
            </button>
            <p className="absolute text-xs -bottom-1 left-5 text-destructive">
              {formik.touched.password && formik.errors.password
                ? formik.errors.password
                : null}
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Button
              type="submit"
              title="Log In"
              size="lg"
              disabled={isLoading}
              className="w-[92%] mt-5 rounded-md"
            >
              {isLoading ? <BtnLoader /> : "Log in"}
            </Button>
          </div>
          <div className="flex items-center justify-center w-full gap-2 px-5 pt-5 text-sm">
            <p>Don't have an account?</p>
            <Link to="/register/form" className="text-blue-500">
              Sing up
            </Link>
          </div>
        </main>
      </form>
    </section>
  );
}
