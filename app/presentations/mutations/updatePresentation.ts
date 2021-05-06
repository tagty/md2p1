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
    // TODO: get slides
    const slideDelete = await db.slide.findFirst({
      where: {
        presentationId: data.id,
      },
      orderBy: {
        id: "desc",
      },
    })

    const slideIdDelete = slideDelete?.id

    console.log(slideIdDelete)

    const blocksDelete = await db.block.findMany({
      where: {
        slideId: slideIdDelete,
      },
    })

    const buildableIds = blocksDelete.map((block) => block.buildableId)

    console.log(buildableIds)

    // [{type: '', id: ''}, {type: '', id: ''}]
    const buildables = blocksDelete.map((block) => {
      return {
        type: block.buildableType,
        id: block.id,
      }
    })

    console.log(buildables)

    const deleteBlocks = db.block.deleteMany({
      where: {
        slideId: slideIdDelete,
      },
    })

    const deleteSlide = db.slide.delete({
      where: {
        id: slideIdDelete,
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

    // const text = data.text.replace("# ", "")

    // const blockH1 = await db.blockH1.create({
    //   data: {
    //     text: text,
    //   },
    // })

    // await db.block.create({
    //   data: {
    //     text: data.text,
    //     buildableId: blockH1.id,
    //     buildableType: "BlockH1",
    //     slideId: slide.id,
    //   },
    // })

    const rows = data.text.split("\n")

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
            text: data.text,
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
            text: data.text,
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
