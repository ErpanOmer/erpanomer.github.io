import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        cover: z.string().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        image: z.string().optional(),
        tags: z.array(z.string()).default([]),
        link: z.string().optional(),
        github: z.string().optional(),
        featured: z.boolean().default(false),
        order: z.number().default(0),
    }),
});

export const collections = { blog, projects };
