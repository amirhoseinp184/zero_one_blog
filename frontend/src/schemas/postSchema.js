import * as z from "zod";

const postSchema = z.object({
  title: z
    .string({
      error: (iss) => (iss.input === undefined ? "عنوان اجباری است." : "نوع داده نامعتبر است."),
    })
    .min(10, { error: (iss) => `عنوان باید حداقل ${iss.minimum} کاراکتر باشد.` })
    .max(100, { error: (iss) => `عنوان باید حداکثر ${iss.maximum} کاراکتر باشد.` }),
  content: z
    .string({
      error: (iss) => (iss.input === undefined ? "محتوا اجباری است." : "نوع داده نامعتبر است"),
    })
    .min(300, { error: (iss) => `محتوا باید حداقل ${iss.minimum} کاراکتر باشد.` }),
  status: z.enum(["published", "draft"]),
});

export default postSchema;
