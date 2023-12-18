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
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import TextareaAutosize from "react-textarea-autosize";
import { Input } from "../../ui/input";
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
} from "../../ui/select";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import Button from "../../ui/button";
import { validateError } from "@/lib/validateError";
import { useRouter } from "next/navigation";
import { IDocument } from "@/model/document";

interface EditDocumentFormProps {
  dialogTrigger?: ReactNode;
  document: IDocument;
}

type FormData = z.infer<typeof documentValidationSchema>;

const EditDocumentForm = ({
  dialogTrigger,
  document,
}: EditDocumentFormProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

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
      await axios.patch("/api/document", {
        id: document._id,
        title: data.title,
        description: data.description,
        category: data.category,
      });
    } catch (e) {
      const message = validateError(
        e,
        "Something went wrong when editing the document"
      );
      return toast.error(message);
    } finally {
      setIsLoading(false);
    }

    toast.success("Document successfully edited");
    router.refresh();
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogTrigger
          onClick={(e) => {
            e.preventDefault();
            setIsOpen((prev) => !prev);
            e.stopPropagation();
          }}
        >
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
                defaultValue={document.title}
                type="text"
                autoComplete="some-random-val"
                placeholder="Title"
                id="title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <TextareaAutosize
                defaultValue={document.description}
                autoComplete="some-random-val-2"
                placeholder="Description"
                id="description"
                {...register("description")}
                className="flex min-h-[40px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    defaultValue={document.category}
                    {...field}
                    onValueChange={field.onChange}
                  >
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
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
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

export default EditDocumentForm;
