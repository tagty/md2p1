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

    const slide = await db.slide.create({
      data: {
        text: input.text,
        presentationId: presentation.id,
      },
    })

    const rows = input.text.split("\n")

    for (let row of rows) {
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
    }

    return presentation
  }
)
