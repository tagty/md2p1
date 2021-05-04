import { resolver } from "blitz"
import db from "db"
import * as z from "zod"

const DeletePresentation = z
  .object({
    id: z.number(),
  })
  .nonstrict()

export default resolver.pipe(
  resolver.zod(DeletePresentation),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const presentation = await db.presentation.deleteMany({ where: { id } })

    return presentation
  }
)
