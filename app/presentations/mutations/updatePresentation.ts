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

    const blocksDelete = await db.block.findMany({
      where: {
        slideId: slideDeleteId,
      },
    })

    const buildableIds = blocksDelete.map((block) => block.buildableId)

    const deleteBlocks = db.block.deleteMany({
      where: {
        slideId: slideDeleteId,
      },
    })

    const deleteSlide = db.slide.delete({
      where: {
        id: slideDeleteId,
      },
    })

    await db.$transaction([deleteBlocks, deleteSlide])

    for (let buildableId of buildableIds) {
      await db.blockH1.delete({
        where: {
          id: Number(buildableId),
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

    const text = data.text.replace("# ", "")

    const blockH1 = await db.blockH1.create({
      data: {
        text: text,
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
