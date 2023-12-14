// utils
import { fileUploadSchema } from "@/lib/validations/fileUploadValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// radix
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
  Card,
} from "@/components/ui/card";
// components
import Button from "@/components/ui/button";
import { HTMLAttributes, ReactNode, memo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { cn } from "@/lib/utils";
import ImagePlaceholder from "@/../public/assets/image-placeholder.jpg";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { validateError } from "@/lib/validateError";

interface ImageFormProps extends HTMLAttributes<HTMLDivElement> {
  photoUrl: string;
  setPhotoUrl: (value: string) => void;
  imageClassName?: string;
  children: ReactNode;
  formTitle?: string;
  defaultErrorMessage?: string;
}

type FormData = z.infer<typeof fileUploadSchema>;

const ImageForm = ({
  photoUrl,
  setPhotoUrl,
  className,
  children,
  imageClassName,
  formTitle,
  defaultErrorMessage,
  ...props
}: ImageFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fileUploadSchema),
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function onSubmit(data: FormData, e: any) {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    const formData = new FormData();

    formData.append("images", data.files[0]);

    try {
      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // result is ok
      const filepath = `${process.env.NEXT_PUBLIC_BASE_URL}uploads/${data.files[0].name}`;
      setPhotoUrl(filepath);
    } catch (e) {
      const message = validateError(
        e,
        defaultErrorMessage || "Something went wrong when uploading the photo"
      );
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const currentFiles: FileList | null = watch("files") || null;

  return (
    <Card className="max-w-md" {...props}>
      <CardContent className="max-w-[460px] sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)} className="static">
          <CardHeader>
            <CardTitle className="text-gray-800">
              {formTitle || "Add a photo"}
            </CardTitle>
          </CardHeader>

          <div
            className={cn(
              "relative isolate mx-auto mb-8 flex-1 cursor-pointer overflow-hidden rounded-full bg-slate-100",
              className
            )}
          >
            {errors?.files && (
              <p className="bottom absolute-0 left-0 w-[200%] text-center text-sm text-red-600">
                {errors.files.message?.toString()}
              </p>
            )}
            <input
              multiple={false}
              required
              id="file"
              accept="image/*"
              type="file"
              {...register("files")}
              className="absolute inset-0 z-[2] h-full w-full cursor-pointer opacity-0"
            />
            {photoUrl ? (
              <img
                src={
                  currentFiles?.length && currentFiles[0] instanceof File
                    ? URL.createObjectURL(currentFiles[0])
                    : photoUrl
                }
                alt="Zdjęcie Profilowe"
                className={cn(
                  "h-full w-full rounded-md object-cover",
                  imageClassName
                )}
              />
            ) : (
              <div className="relative isolate h-full w-full">
                <Image
                  alt="Preview zdjęcia profilowego"
                  fill
                  src={
                    currentFiles &&
                    currentFiles.length &&
                    URL.createObjectURL(currentFiles[0])
                      ? URL.createObjectURL(currentFiles[0])
                      : ImagePlaceholder
                  }
                  className={cn(
                    "h-full w-full rounded-md object-cover",
                    imageClassName
                  )}
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit(onSubmit)}
            variant="default"
            isLoading={isLoading}
            className="w-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default memo(ImageForm);
