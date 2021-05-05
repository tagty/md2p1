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

    const blockH1 = await db.blockH1.create({
      data: {
        text: input.text,
      },
    })

    await db.block.create({
      data: {
        text: input.text,
        buildableId: blockH1.id,
        buildableType: "BlockH1",
        slideId: slide.id,
      },
    })

    return presentation
  }
)
