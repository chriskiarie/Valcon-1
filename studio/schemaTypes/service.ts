import { defineField, defineType } from "sanity";
import { photo, text } from "./fields";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Web address name",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    text("summary", "Description", "One or two sentences.", 4),
    photo("image", "Photo", "Wide photo, 1200 x 800 or larger."),
    defineField({ name: "isPlaceholder", title: "Draft wording (to be confirmed)", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Position in the list", type: "number", initialValue: 10, validation: (r) => r.required().integer().min(1) }),
  ],
  orderings: [{ title: "Position", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", media: "image" } },
});
