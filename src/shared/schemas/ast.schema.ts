import { z } from 'zod';

// Primitive Operations
export const PrimitiveOpSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('sum'),
    left: z.union([z.number(), z.string()]), // string for variable reference
    right: z.union([z.number(), z.string()]),
    target: z.string().optional(), // Optional variable to store result
  }),
  z.object({
    type: z.literal('eq'),
    left: z.union([z.number(), z.string(), z.boolean()]),
    right: z.union([z.number(), z.string(), z.boolean()]),
    target: z.string().optional(),
  }),
  z.object({
    type: z.literal('gt'),
    left: z.union([z.number(), z.string()]),
    right: z.union([z.number(), z.string()]),
    target: z.string().optional(),
  }),
]);

// UI Operations
export const UIOpSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('say'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('prompt'),
    text: z.string(),
    variable: z.string(), // Where to store the user's response
  }),
  z.object({
    type: z.literal('media'),
    url: z.string(),
    caption: z.string().optional(),
  }),
]);

// Flow Operations
export const FlowOpSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('if'),
    condition: z.any(), // This could be a PrimitiveOp or a simple boolean expression
    then: z.lazy(() => NodeSchema.array()),
    else: z.lazy(() => NodeSchema.array()).optional(),
  }),
  z.object({
    type: z.literal('sequence'),
    nodes: z.lazy(() => NodeSchema.array()),
  }),
  z.object({
    type: z.literal('wait_input'),
    // Implicitly pauses execution until user input is received
  }),
]);

// Combined Node Schema
export const NodeSchema = z.union([PrimitiveOpSchema, UIOpSchema, FlowOpSchema]);

export type PrimitiveOp = z.infer<typeof PrimitiveOpSchema>;
export type UIOp = z.infer<typeof UIOpSchema>;
export type FlowOp = z.infer<typeof FlowOpSchema>;
export type Node = z.infer<typeof NodeSchema>;
