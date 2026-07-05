// Central config: env, LLM client, and the channels the agent knows about.
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

export const MODEL = process.env.MODEL;
export const YT_API_KEY = process.env.YT_API_KEY;
export const PORT = process.env.PORT || 3000;

export const client = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

// Channels the tools can query. `alias` is what the model passes in TOOL_REQUEST.
export const CHANNELS = {
  chai: { handle: "chaiaurcode", label: "Chai aur Code (Hitesh)" },
  lab: { handle: "HiteshCodeLab", label: "Hitesh Code Lab (Hitesh)" },
  piyush: { handle: "piyushgargdev", label: "Piyush Garg" },
};

// Static portfolio (hitesh.ai + piyushgarg.dev). Cheap, no API call.
export const LINKS = {
  hitesh: {
    portfolio: "https://hitesh.ai/",
    youtube: { chaiAurCode: "@chaiaurcode", hiteshCodeLab: "@HiteshCodeLab" },
    platforms: { chaicode: "chaicode.com", masterji: "masterji.co" },
    products: { inapp: "inapp.app", webRequestKit: "webrequestkit.com", freeApi: "freeapi.app" },
    socials: { x: "@hiteshdotcom", linkedin: "linkedin.com/in/hiteshchoudhary" },
  },
  piyush: {
    portfolio: "https://piyushgarg.dev/",
    youtube: "@piyushgargdev",
    product: "teachyst.com",
    socials: { x: "@piyushgarg_dev", linkedin: "linkedin.com/in/piyushgarg195" },
  },
  cohort: "chaicode.com (live cohorts by Hitesh & Piyush)",
};
