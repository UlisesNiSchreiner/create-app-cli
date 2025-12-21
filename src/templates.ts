export type TemplateTech = "node" | "react" | "typescript" | "go" | "kotlin" | "java";

export type TemplateDef = {
  key: string;
  repo: string; // owner/repo
  ref?: string; // optional git ref (tag/branch/commit)
  tech: TemplateTech;
  description?: string;
};

export const TEMPLATE_CATALOG = {
  "go-api-rest-template": {
    key: "go-api-rest-template",
    repo: "UlisesNiSchreiner/go-api-rest-template",
    tech: "go",
    description: "Go REST API template (Gin/SQL, cloud-ready Dockerfile).",
  },
  "node-api-rest-template": {
    key: "node-api-rest-template",
    repo: "UlisesNiSchreiner/node-api-rest-template",
    tech: "node",
    description: "Node.js REST API template, cloud-ready Dockerfile.",
  },
  "react-ts-web-app-template": {
    key: "react-ts-web-app-template",
    repo: "UlisesNiSchreiner/react-ts-web-app-template",
    tech: "react",
    description: "React + TypeScript web app template.",
  },
  "react-next-ts-web-app-template": {
    key: "react-next-ts-web-app-template",
    repo: "UlisesNiSchreiner/react-next-ts-web-app-template",
    tech: "react",
    description: "Next.js + TypeScript web app template.",
  },
  "typescript-lib-template": {
    key: "typescript-lib-template",
    repo: "UlisesNiSchreiner/typescript-lib-template",
    tech: "typescript",
    description: "TypeScript library template.",
  },
  template_gn_middleend: {
    key: "template_gn_middleend",
    repo: "UlisesNiSchreiner/template_gn_middleend",
    tech: "node",
    description: "GN middleend template.",
  },
  template_gn_web_cli: {
    key: "template_gn_web_cli",
    repo: "UlisesNiSchreiner/template_gn_web_cli",
    tech: "node",
    description: "GN web CLI template.",
  },
  template_gn_rn_cli: {
    key: "template_gn_rn_cli",
    repo: "UlisesNiSchreiner/template_gn_rn_cli",
    tech: "node",
    description: "GN RN CLI template.",
  },
} satisfies Record<string, TemplateDef>;

export type TemplateKey = keyof typeof TEMPLATE_CATALOG;
