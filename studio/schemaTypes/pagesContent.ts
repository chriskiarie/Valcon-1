import { defineField, defineType } from "sanity";
import { text } from "./fields";

export const pagesContent = defineType({
  name: "pagesContent",
  title: "Fleet and contact pages",
  type: "document",
  fields: [
    defineField({
      name: "fleet",
      title: "Fleet page",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        text("eyebrow", "Small line above the title"),
        text("title", "Title"),
        text("lede", "Introduction", undefined, 3),
        text("metaDescription", "Search result description", undefined, 3),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contact page",
      type: "object",
      options: { collapsible: true, collapsed: false },
      fields: [
        text("title", "Title"),
        text("lede", "Introduction", undefined, 3),
        text("panelEyebrow", "Form label"),
        text("panelTitle", "Form heading"),
        text("metaDescription", "Search result description", undefined, 3),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Fleet and contact pages" }) },
});
