import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { encryptText } from "@/utils/helper";
import { Input } from "@/components/ui/input";
import { useRequestVerifyEmailMutation } from "@/service/slices/auth/authApiSlice";
import BtnsLoaderSpinner from "@/components/loader/BtnLoader";
export default function RegisterForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();
  const [verify, { isLoading, error, isError }] =
    useRequestVerifyEmailMutation();
  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      userName: sessionStorage.getItem("userName") as string,
      email: sessionStorage.getItem("email") as string,
      password: "",
      confirmpass: "",
    },
    validationSchema: new Yup.ObjectSchema({
      userName: Yup.string().required("User Name is required"),
      email: Yup.string().required("Email is required").email("Invalid email"),
      password: Yup.string().required("Create your password"),
      confirmpass: Yup.string()
        .required("Confirm your password")
        .oneOf([Yup.ref("password")], "Password doesn't match!"),
    }),
    onSubmit: async (values) => {
      if (values.password !== values.confirmpass) {
        return;
      }
      sessionStorage.setItem("userName", values.userName);
      sessionStorage.setItem("email", values.email);
      sessionStorage.setItem("password", encryptText(values.password));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await verify({
        email: values.email,
        userName: values.userName,
      });
      if (res?.data?.email) {
        navigate("/register/otp");
      }
    },
  });
  const handleCancel = () => {
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("password");
    navigate("/login");
  };

  return (
    <div className="w-full max-w-[35em] flex flex-col items-center gap-5  px-2 py-2  md:border rounded-md relative ">
      <header className="relative flex flex-col items-center w-full gap-3 pt-5">
        <Button
          size="sm"
          type="button"
          onClick={handleCancel}
          variant="ghost"
          className="absolute top-0 left-2"
        >
          Log In
        </Button>
        <h5 className="text-lg font-semibold">Create your account</h5>
        <h1 className="text-lg font-black">Sign up</h1>
        <p className="mt-2 text-sm text-destructive">
          {isError
            ? error?.data?.error ??
              "Failed to register. Please try again later!"
            : null}
        </p>
      </header>
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col items-center w-full gap-7"
      >
        <div className="w-[90%] flex flex-col gap-1 relative">
          <Label htmlFor="userName" className="text-sm font-semibold">
            User Name
          </Label>
          <Input
            type="text"
            ref={inputRef}
            id="userName"
            autoComplete="false"
            placeholder="Enter your user name"
            value={formik.values.userName || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full  ${
              formik.touched.userName && formik.errors.userName
                ? "border-destructive"
                : "border-border"
            }  `}
          />
          <p className="absolute left-0 text-xs -bottom-5 text-destructive">
            {formik.touched.userName && formik.errors.userName
              ? formik.errors.userName
              : null}
          </p>
        </div>
        <div className="w-[90%] flex flex-col gap-1 relative">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email
          </Label>
          <Input
            type="text"
            id="email"
            autoComplete="false"
            placeholder="Enter your Email"
            value={formik.values.email || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full  ${
              formik.touched.email && formik.errors.email
                ? "border-destructive"
                : "border-border"
            }  `}
          />
          <p className="absolute left-0 text-xs -bottom-5 text-destructive">
            {formik.touched.email && formik.errors.email
              ? formik.errors.email
              : null}
          </p>
        </div>
        <div className="w-[90%] flex flex-col gap-1 relative">
          <Label htmlFor="password" className="text-sm font-semibold">
            Create password
          </Label>
          <Input
            type={isShowPassword ? "text" : "password"}
            id="password"
            autoComplete="false"
            placeholder="Create your password"
            value={formik.values.password || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full ${
              formik.touched.password && formik.errors.password
                ? "border-destructive"
                : "border-border"
            } `}
          />
          <p className="absolute left-0 text-xs -bottom-5 text-destructive">
            {formik.touched.password && formik.errors.password
              ? formik.errors.password
              : null}
          </p>
        </div>
        <div className="w-[90%] flex flex-col gap-1 relative">
          <Label htmlFor="confirmpass" className="text-sm font-semibold">
            Confirm password
          </Label>
          <Input
            type={isShowPassword ? "text" : "password"}
            id="confirmpass"
            placeholder="Confirm your password"
            autoComplete="false"
            value={formik.values.confirmpass || ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full  ${
              formik.touched.confirmpass && formik.errors.confirmpass
                ? "border-destructive"
                : "border-border"
            } `}
          />
          <p className="absolute left-0 text-xs -bottom-5 text-destructive">
            {formik.touched.confirmpass && formik.errors.confirmpass
              ? formik.errors.confirmpass
              : null}
          </p>
        </div>
        <div className="w-[90%] flex mt-2 items-center gap-2">
          <Input
            type="checkbox"
            className="w-4 h-4"
            onChange={(e) => {
              if (e.target.checked) {
                setIsShowPassword(true);
              } else {
                setIsShowPassword(false);
              }
            }}
          />
          <p className="text-sm">Show password</p>
        </div>

        <div className="flex justify-center w-full gap-2 px-5 ">
          <Button
            size="lg"
            type="submit"
            disabled={isLoading}
            variant="default"
            className="w-[98%]"
          >
            {isLoading ? <BtnsLoaderSpinner /> : "Submit"}
          </Button>
        </div>
      </form>
      <div className="flex items-center justify-center w-full gap-2 px-5 pt-5 pb-5 text-sm">
        <p>Already have an account?</p>
        <button onClick={handleCancel} className="text-blue-500">
          Login
        </button>
      </div>
    </div>
  );
}
