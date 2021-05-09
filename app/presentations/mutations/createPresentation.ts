import { resolver } from "blitz"
import db from "db"
import * as z from "zod"

const CreatePresentation = z
  .object({
    title: z.string(),
    text: z.string(),
  })
  .nonstrict()

export default resolver.pipe(
  resolver.zod(CreatePresentation),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const presentation = await db.presentation.create({ data: input })

    const slidesText = input.text.split("---\n")

    slidesText.forEach(async (slideText) => {
      const slide = await db.slide.create({
        data: {
          text: slideText,
          presentationId: presentation.id,
        },
      })

      const rows = slideText.split("\n")

      rows.forEach(async (row, index) => {
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
              number: index,
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
              number: index,
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
