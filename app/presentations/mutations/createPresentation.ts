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
