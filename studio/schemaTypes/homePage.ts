import { defineField, defineType } from "sanity";
import { responsiveImage, text, bannerPhotos } from "./fields";

const group = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineField({ name, title, type: "object", options: { collapsible: true, collapsed: false }, fields });

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    group("hero", "Top banner", [
      text("eyebrow", "Small line above the headline"),
      text("title", "Headline", "Keep it short. It sets in two lines.", 2),
      text("support", "Supporting line", undefined, 3),
      bannerPhotos("slides", "Banner photos"),
      text("primaryCta", "Main button label"),
      text("secondaryCta", "Second button label"),
    ]),
    group("intro", "Introduction", [
      text("eyebrow", "Small label"),
      text("statement", "Large statement", undefined, 3),
      text("support", "Paragraph beneath", undefined, 3),
      responsiveImage("image", "Feature photo", true),
    ]),
    group("fleet", "Fleet section", [
      text("heading", "Heading on the home page"),
      text("pageHeading", "Heading on the fleet page"),
      text("linkLabel", "Link label"),
    ]),
    group("arrival", "New arrival card", [
      text("eyebrow", "Small label"),
      text("aircraftSlug", "Which aircraft it opens", "Must match an aircraft's web address name, for example crj200-lr-5y-val."),
      text("registrationLabel", "Label above the registration"),
      text("registration", "Registration shown on the card"),
      text("title", "Title"),
      text("line", "Line beneath the title"),
      text("routeFrom", "Route label, start"),
      text("routeTo", "Route label, end"),
      text("buttonLabel", "Button label"),
    ]),
    group("services", "Services section", [
      text("eyebrow", "Small label"),
      text("heading", "Heading"),
      text("imageButtonLabel", "Image button label"),
      text("bestForLabel", "Label above each card's \"best for\" line"),
      text("quoteLabel", "Link label on each card"),
    ]),
    group("howItWorks", "How it works", [
      defineField({
        name: "show",
        title: "Show this section",
        type: "boolean",
        initialValue: true,
      }),
      text("eyebrow", "Small label"),
      text("heading", "Heading", undefined, 2),
      text("intro", "Line beneath the heading", undefined, 3),
      defineField({
        name: "steps",
        title: "Stages",
        type: "array",
        description: "One entry per stage, in order. Six reads best.",
        of: [
          {
            type: "object",
            fields: [
              defineField({ name: "title", title: "Stage name", type: "string", validation: (r) => r.required() }),
              defineField({ name: "text", title: "What happens", type: "text", rows: 3 }),
            ],
            preview: { select: { title: "title", subtitle: "text" } },
          },
        ],
      }),
      text("acmiNote", "Note about ACMI", "Shown as small text. Leave empty to hide it.", 3),
    ]),
    group("about", "About us", [
      defineField({
        name: "show",
        title: "Show this section",
        type: "boolean",
        description: "Keep this off until the client approves the wording.",
        initialValue: false,
      }),
      text("eyebrow", "Small label"),
      text("heading", "Heading", "Press Enter to force a line break.", 2),
      defineField({
        name: "story",
        title: "Story",
        type: "array",
        description: "One entry per paragraph.",
        of: [{ type: "text", rows: 4 }],
      }),
      text("closing", "Closing line"),
      defineField({
        name: "values",
        title: "Values",
        type: "array",
        of: [
          {
            type: "object",
            fields: [
              defineField({ name: "title", title: "Value", type: "string", validation: (r) => r.required() }),
              defineField({ name: "text", title: "Line beneath", type: "string" }),
            ],
            preview: { select: { title: "title", subtitle: "text" } },
          },
        ],
      }),
    ]),
    group("gallery", "Video gallery", [
      text("eyebrow", "Small label"),
      text("heading", "Heading"),
      defineField({
        name: "videos",
        title: "Videos",
        type: "array",
        description: "Short upright (vertical) MP4 clips. They loop silently with no controls. Keep each under about 15 MB. The section stays hidden until you add one.",
        of: [
          {
            type: "object",
            fields: [
              defineField({ name: "video", title: "Video file (MP4)", type: "file", options: { accept: "video/mp4" }, validation: (r) => r.required() }),
              defineField({ name: "caption", title: "Description (hidden, for screen readers)", type: "string" }),
            ],
            preview: { select: { title: "caption" }, prepare: ({ title }) => ({ title: title || "Video" }) },
          },
        ],
      }),
    ]),
    group("visit", "Visit and call band", [
      text("eyebrow", "Small label"),
      text("title", "Title"),
      text("line", "Line beneath the title", undefined, 3),
      text("addressLabel", "Label above the address"),
      text("phoneLabel", "Label above the phone"),
      text("emailLabel", "Label above the email"),
      text("hoursLabel", "Label above the hours"),
    ]),
    group("closing", "Closing call to action", [
      text("eyebrow", "Small label"),
      text("title", "Title"),
      text("support", "Supporting line", undefined, 3),
      text("primaryCta", "Main button label"),
    ]),
    group("socials", "Social media band", [
      text("title", "Line beside the icons"),
      text("line", "Small paragraph beneath", undefined, 3),
    ]),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
