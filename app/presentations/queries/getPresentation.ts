import { resolver, NotFoundError } from "blitz"
import db from "db"
import * as z from "zod"

const GetPresentation = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetPresentation),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const presentation = await db.presentation.findFirst({ where: { id } })

    if (!presentation) throw new NotFoundError()

    return presentation
  }
)
