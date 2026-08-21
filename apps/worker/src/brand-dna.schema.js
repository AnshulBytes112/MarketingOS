"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandDNASchema = exports.BrandDNASourcesSchema = exports.BrandDNASourceSchema = void 0;
const zod_1 = require("zod");
exports.BrandDNASourceSchema = zod_1.z.object({
    type: zod_1.z.enum(["ONBOARDING", "PRODUCTS", "COMPETITORS", "ASSET"]),
    label: zod_1.z.string(),
    assetId: zod_1.z.string().optional(),
});
exports.BrandDNASourcesSchema = zod_1.z.array(exports.BrandDNASourceSchema);
exports.BrandDNASchema = zod_1.z.object({
    personality: zod_1.z.string().describe("Brand personality description"),
    voice: zod_1.z.string().describe("Brand voice description"),
    tone: zod_1.z.string().describe("Brand tone description"),
    positioning: zod_1.z.string().describe("Positioning statement"),
    visualIdentitySummary: zod_1.z.string().describe("Summary of visual identity"),
    audience: zod_1.z.string().describe("Primary and secondary audience"),
    contentPillars: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        percentage: zod_1.z.number(),
        color: zod_1.z.string(),
        textColor: zod_1.z.string()
    })).describe("5 content pillars summing to 100%"),
    language: zod_1.z.string().describe("Language characteristics"),
    ctaPreferences: zod_1.z.string().describe("Call to action style"),
    avoidList: zod_1.z.array(zod_1.z.string()).describe("List of things to avoid"),
    claims: zod_1.z.array(zod_1.z.string()).describe("Verified claims to use"),
    constraints: zod_1.z.array(zod_1.z.string()).describe("Hard constraints")
});
