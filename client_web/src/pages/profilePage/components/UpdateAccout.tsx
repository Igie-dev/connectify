import React, { useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useUpdateUserMutation } from "@/service/slices/user/userApiSlice";
import BtnsLoaderSpinner from "@/components/loader/BtnLoader";
type Props = {
  user: TUserData;
};
export default function UpdateAccout({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [update, { isLoading, error }] = useUpdateUserMutation();
  const formik = useFormik({
    initialValues: {
      userName: "",
    },
    validationSchema: new Yup.ObjectSchema({
      userName: Yup.string().required("Please provide user name"),
    }),
    onSubmit: async (values) => {
      if (user?.userName === values.userName) return;

      const data = {
        userId: user.userId,
        userName: values.userName,
      };

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await update(data);
        if (res?.data) {
          setOpen(false);
        }
        // eslint-disable-next-line no-empty
      } catch (error) {}
    },
  });

  useLayoutEffect(() => {
    if (open) {
      if (!formik.values.userName) {
        formik.setValues({
          userName: user.userName,
        });
      }
    } else {
      if (formik.values.userName) {
        formik.resetForm();
      }
    }
  }, [user, open, formik]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Update profile
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[30rem]">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col w-full gap-5"
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <p>{error?.data?.error}</p>
          <div className="flex flex-col gap-6">
            <div className="relative flex flex-col gap-1">
              <Label htmlFor="userName">User Name</Label>
              <Input
                id="userName"
                value={formik.values.userName}
                placeholder="Last Name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                disabled={isLoading}
                className={`${
                  formik.touched.userName && formik.errors.userName
                    ? "border-destructive"
                    : "border-border"
                }`}
              />
              <p className="absolute left-0 text-xs -bottom-5 text-destructive">
                {formik.touched.userName && formik.errors.userName
                  ? formik.errors.userName
                  : null}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                user?.userName === formik.values.userName ||
                !formik.values.userName ||
                isLoading
              }
            >
              {isLoading ? <BtnsLoaderSpinner /> : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
