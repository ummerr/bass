import { z } from "zod";

export const TuningSchema = z.literal("EADG");

export const BassStringSchema = z.enum(["E", "A", "D", "G"]);

export const FretSchema = z.number().int().min(0).max(24);

export const DurationSchema = z.enum([
  "1/1",
  "1/2",
  "1/4",
  "1/8",
  "1/16",
  "1/32",
  "1/4.",
  "1/8.",
  "1/16.",
  "1/4t",
  "1/8t",
  "1/16t",
]);

export const BeatSchema = z.number().int().min(1).max(4);
export const SubBeatSchema = z.number().int().min(0).max(3);

export const NoteSchema = z
  .object({
    bar: z.number().int().positive().default(1),
    beat: BeatSchema,
    sub: SubBeatSchema.default(0),
    dur: DurationSchema,
    string: BassStringSchema.optional(),
    fret: FretSchema.optional(),
    rest: z.boolean().optional(),
  })
  .refine(
    (n) =>
      n.rest === true
        ? n.string === undefined && n.fret === undefined
        : n.string !== undefined && n.fret !== undefined,
    { message: "Note requires either rest=true or both string and fret" },
  );

export const SectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  bars: z.array(NoteSchema).min(1),
});

export const LoopRefSchema = z.object({
  sectionId: z.string().min(1),
  name: z.string().min(1),
});

export const ProvenanceSourceSchema = z.object({
  url: z.string().min(1),
  retrieved: z.string().min(1),
});

export const ProvenanceSchema = z.object({
  sources: z.array(ProvenanceSourceSchema).default([]),
  agents: z.array(z.string()).default([]),
  consensus: z.enum(["unanimous", "resolved", "pending", "disputed"]).optional(),
  disagreements: z.array(z.unknown()).default([]),
  ummerr_verified: z.string().optional(),
});

export const CategorySchema = z.enum([
  "rock",
  "alt",
  "pop",
  "funk",
  "reggae",
  "blues",
  "prog",
]);

export const StructuredTabSchema = z
  .object({
    title: z.string().min(1),
    artist: z.string().default(""),
    tuning: TuningSchema,
    key: z.string().default(""),
    tempo: z.number().nonnegative().default(0),
    difficulty: z.number().int().min(1).max(5).default(1),
    techniques: z.array(z.string()).default([]),
    category: CategorySchema.optional(),
    startHere: z.boolean().default(false),
    sections: z.array(SectionSchema).min(1),
    loops: z.array(LoopRefSchema).default([]),
    provenance: ProvenanceSchema.optional(),
  })
  .superRefine((tab, ctx) => {
    const ids = new Set(tab.sections.map((s) => s.id));
    tab.loops.forEach((loop, i) => {
      if (!ids.has(loop.sectionId)) {
        ctx.addIssue({
          code: "custom",
          path: ["loops", i, "sectionId"],
          message: `Unknown section id "${loop.sectionId}"`,
        });
      }
    });
  });

export type StructuredTab = z.infer<typeof StructuredTabSchema>;
export type TabNote = z.infer<typeof NoteSchema>;
export type TabSection = z.infer<typeof SectionSchema>;
export type TabLoopRef = z.infer<typeof LoopRefSchema>;
export type TabProvenance = z.infer<typeof ProvenanceSchema>;
export type BassString = z.infer<typeof BassStringSchema>;
export type Duration = z.infer<typeof DurationSchema>;
export type TabCategory = z.infer<typeof CategorySchema>;

export const CATEGORIES: readonly TabCategory[] = [
  "rock",
  "alt",
  "pop",
  "funk",
  "reggae",
  "blues",
  "prog",
] as const;

export const CATEGORY_LABELS: Record<TabCategory, string> = {
  rock: "Rock",
  alt: "Alt / Punk",
  pop: "Pop",
  funk: "Funk & Soul",
  reggae: "Reggae",
  blues: "Blues",
  prog: "Progressive",
};
