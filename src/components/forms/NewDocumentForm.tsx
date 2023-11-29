"use client";

// types
import { ReactNode, useState } from "react";
// components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import TextareaAutosize from "react-textarea-autosize";
import { Input } from "../ui/input";
// hooks
import { Controller, useForm } from "react-hook-form";
// zod
import { documentValidationSchema } from "@/lib/validations/documentValidation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import Button from "../ui/button";

interface NewDocumentFormProps {
  dialogTrigger?: ReactNode;
}

type FormData = z.infer<typeof documentValidationSchema>;

const NewDocumentForm = ({ dialogTrigger }: NewDocumentFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(documentValidationSchema) });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const res = await axios.post("/api/document", {
        title: data.title,
        description: data.description,
        category: data.category,
      });
      console.log(res);
    } catch (e) {
      console.log(e);
      if (
        e instanceof AxiosError &&
        e.response?.status?.toString()[0] === "4" &&
        e.response?.data?.message
      ) {
        toast.error(e.response.data.message);
        return null;
      } else if (e instanceof z.ZodError) {
        toast.error("Form filled out incorrectly");
        return null;
      } else {
        toast.error("Something went wrong when creating the new document");
        return null;
      }
    } finally {
      setIsLoading(false);
    }

    toast.success("New document created");
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {dialogTrigger || <div>New Document</div>}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Document</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                type="text"
                autoComplete="some-random-val"
                placeholder="Title"
                id="title"
                {...register("title")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <TextareaAutosize
                autoComplete="some-random-val-2"
                placeholder="Description"
                id="description"
                {...register("description")}
                className="flex min-h-[40px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Button className="mt-1" isLoading={isLoading} type="submit">
              Submit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDocumentForm;
