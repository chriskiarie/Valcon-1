import { defineField, defineType } from "sanity";
import { photo, text } from "./fields";

export const aircraft = defineType({
  name: "aircraft",
  title: "Aircraft",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Web address name",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      description: "Generated from the name. It forms the link to this aircraft.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "registrations",
      title: "Registration(s)",
      type: "array",
      of: [{ type: "string" }],
      description: "For example: 5Y-VAL. Leave empty if not yet known.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "In fleet", value: "active" },
          { title: "Sample / coming soon", value: "coming-soon" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (r) => r.required(),
    }),
    defineField({ name: "isPlaceholder", title: "Sample card (not a real aircraft)", type: "boolean", initialValue: false }),
    text("summary", "Short description", "Two or three sentences. Only state facts you have confirmed.", 4),
    defineField({
      name: "specs",
      title: "Specifications (optional)",
      type: "object",
      description: "Leave blank anything not confirmed. Blank fields are not shown on the site.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "seats", title: "Seats", type: "number", validation: (r) => r.integer().min(1) }),
        text("range", "Range"),
        text("cruiseSpeed", "Cruise speed"),
      ],
    }),
    defineField({ name: "features", title: "Features (optional)", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "hero",
      title: "Main photo",
      type: "object",
      fields: [
        photo("desktop", "Photo", "Wide photo, 1200 x 800 or larger. Use the crop tool to choose what stays in view."),
        defineField({ name: "alt", title: "Describe the photo", type: "string", validation: (r) => r.max(160) }),
      ],
    }),
    defineField({
      name: "gallery",
      title: "More photos (optional)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            photo("image", "Photo"),
            defineField({ name: "alt", title: "Describe the photo", type: "string" }),
          ],
          preview: { select: { title: "alt", media: "image" } },
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Position in the list",
      type: "number",
      description: "1 shows first. Smaller numbers come earlier.",
      initialValue: 10,
      validation: (r) => r.required().integer().min(1),
    }),
  ],
  orderings: [{ title: "Position", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "registrations.0", media: "hero.desktop" },
  },
});
