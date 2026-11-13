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
    ]),
    group("closing", "Closing call to action", [
      text("eyebrow", "Small label"),
      text("title", "Title"),
      text("support", "Supporting line", undefined, 3),
      text("primaryCta", "Main button label"),
    ]),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});
