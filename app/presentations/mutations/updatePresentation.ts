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

    // Update
    const presentation = await db.presentation.update({ where: { id }, data })

    // Delete
    const slidesDelete = await db.slide.findMany({
      where: {
        presentationId: id,
      },
    })

    slidesDelete.forEach(async (slide) => {
      const slideId = slide?.id

      const blocks = await db.block.findMany({
        where: {
          slideId: slideId,
        },
      })

      const buildables = blocks.map((block) => {
        return {
          type: block.buildableType,
          id: block.buildableId,
        }
      })

      const deleteBlocks = db.block.deleteMany({
        where: {
          slideId: slideId,
        },
      })

      const deleteSlide = db.slide.delete({
        where: {
          id: slideId,
        },
      })

      await db.$transaction([deleteBlocks, deleteSlide])

      buildables.forEach(async (buildable) => {
        if (buildable["type"] === "BlockH1") {
          await db.blockH1.delete({
            where: {
              id: buildable["id"],
            },
          })
        } else if (buildable["type"] === "BlockList") {
          await db.blockList.delete({
            where: {
              id: buildable["id"],
            },
          })
        }
      })
    })

    // Create
    const slidesText = data.text.split("---\n")

    slidesText.forEach(async (slideText, index) => {
      const slide = await db.slide.create({
        data: {
          text: slideText,
          number: index + 1,
          presentationId: presentation.id,
        },
      })

      const rows = slideText.split("\n")

      rows.forEach(async (row) => {
        if (row.startsWith("# ")) {
          const text = row.replace("# ", "")

          const buildable = await db.blockH1.create({
            data: {
              text: text,
            },
          })

          await db.block.create({
            data: {
              text: row,
              buildableId: buildable.id,
              buildableType: "BlockH1",
              slideId: slide.id,
            },
          })
        } else if (row.startsWith("- ")) {
          const text = row.replace("- ", "")

          const buildable = await db.blockList.create({
            data: {
              text: text,
            },
          })

          await db.block.create({
            data: {
              text: row,
              buildableId: buildable.id,
              buildableType: "BlockList",
              slideId: slide.id,
            },
          })
        }
      })
    })

    return presentation
  }
)
