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
        } else if (buildable["type"] === "BlockImage") {
          await db.blockImage.delete({
            where: {
              id: buildable["id"],
            },
          })
        } else if (buildable["type"] === "BlockCode") {
          await db.blockCode.delete({
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

      // Code
      const slideTextsCode = slideText.split("```")

      const slideTextsCodeReplace = slideTextsCode
        .map((text) => {
          if (text.startsWith(" ")) {
            return text.replace(/\n/g, "__LF__")
          } else {
            return text
          }
        })
        .join("\n")

      const rows = slideTextsCodeReplace.split("\n")

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
        } else if (row.search(/^\[.+\]\(.+\)$/) !== -1) {
          const alt = row
            .replace(/\(.+\)$/, "")
            .replace(/^\[/, "")
            .replace(/\]$/, "")
          const src = row
            .replace(/^\[.+\]/, "")
            .replace(/^\(/, "")
            .replace(/\)$/, "")

          const buildable = await db.blockImage.create({
            data: {
              src: src,
              alt: alt,
            },
          })

          await db.block.create({
            data: {
              text: row,
              number: index,
              buildableId: buildable.id,
              buildableType: "BlockImage",
              slideId: slide.id,
            },
          })
        } else if (row.startsWith(" ")) {
          const array = row.split("__LF__")
          const language = array.shift()?.trim() || "plane"
          const text = array.join("\n")

          const buildable = await db.blockCode.create({
            data: {
              language: language,
              text: text,
            },
          })

          await db.block.create({
            data: {
              text: row,
              number: index,
              buildableId: buildable.id,
              buildableType: "BlockCode",
              slideId: slide.id,
            },
          })
        }
      })
    })

    return presentation
  }
)
