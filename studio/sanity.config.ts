import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, singletonTypes } from "./schemaTypes";

export default defineConfig({
  name: "default",
  title: "Valcon Air",
  projectId: "9sifbw9w",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Website")
          .items([
            S.listItem().title("Site settings").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.listItem().title("Home page").id("homePage").child(S.document().schemaType("homePage").documentId("homePage")),
            S.listItem().title("Fleet and contact pages").id("pagesContent").child(S.document().schemaType("pagesContent").documentId("pagesContent")),
            S.divider(),
            S.documentTypeListItem("aircraft").title("Aircraft"),
            S.documentTypeListItem("service").title("Services"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.includes(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonTypes.includes(context.schemaType)
        ? input.filter(({ action }) => action && !["unpublish", "delete", "duplicate"].includes(action))
        : input,
  },
});
