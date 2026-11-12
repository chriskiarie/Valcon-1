import { defineField } from "sanity";

/** A photo the editor uploads. Hotspot lets them choose which part stays in view when cropped. */
export const photo = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    description,
  });

export const text = (name: string, title: string, description?: string, rows?: number) =>
  defineField({
    name,
    title,
    type: rows ? "text" : "string",
    rows,
    description,
  });

export const linkList = (name: string, title: string, labelHint: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [
      {
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required(), description: labelHint }),
          defineField({ name: "href", title: "Link", type: "string", validation: (r) => r.required() }),
        ],
        preview: { select: { title: "label", subtitle: "href" } },
      },
    ],
  });

export const responsiveImage = (name: string, title: string, withCaption = false) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: false },
    fields: [
      photo("desktop", "Desktop photo", "Wide photo for computers and tablets. Recommended 1920 x 1080 or larger."),
      photo("mobile", "Mobile photo", "Tall photo for phones. Recommended 900 x 1400 or larger."),
      defineField({
        name: "alt",
        title: "Photo description (hidden, for screen readers)",
        type: "string",
        description: "One short sentence for screen readers, for example: An aircraft on the apron at dusk.",
        validation: (r) => r.required().max(160),
      }),
      ...(withCaption ? [text("caption", "Caption (optional)")] : []),
    ],
  });
