import { resolver } from "blitz"
import db from "db"
import * as z from "zod"

const UpdatePresentation = z
  .object({
    id: z.number(),
    title: z.string(),
    text: z.string(),
  })
  .nonstrict()

export default resolver.pipe(
  resolver.zod(UpdatePresentation),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const presentation = await db.presentation.update({ where: { id }, data })

    // Delete
    const slideDelete = await db.slide.findFirst({
      where: {
        presentationId: data.id,
      },
    })

    const slideDeleteId = slideDelete?.id

    const deleteBlocks = db.block.deleteMany({
      where: {
        slideId: slideDeleteId,
      },
    })

    const deleteSlides = db.slide.deleteMany({
      where: {
        presentationId: presentation.id,
      },
    })

    await db.$transaction([deleteBlocks, deleteSlides])

    const buildableIds = await db.block.findMany({
      where: {
        slideId: slideDeleteId,
      },
    })

    for (let buildableId in buildableIds) {
      await db.blockH1.delete({
        where: {
          id: parseInt(buildableId),
        },
      })
    }

    // Create
    const slide = await db.slide.create({
      data: {
        text: data.text,
        presentationId: presentation.id,
      },
    })

    const blockH1 = await db.blockH1.create({
      data: {
        text: data.text,
      },
    })

    await db.block.create({
      data: {
        text: data.text,
        buildableId: blockH1.id,
        buildableType: "BlockH1",
        slideId: slide.id,
      },
    })

    return presentation
  }
)
