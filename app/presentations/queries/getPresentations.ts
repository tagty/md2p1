import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetPresentationsInput
  extends Pick<Prisma.PresentationFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetPresentationsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const { items: presentations, hasMore, nextPage, count } = await paginate({
      skip,
      take,
      count: () => db.presentation.count({ where }),
      query: (paginateArgs) => db.presentation.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      presentations,
      nextPage,
      hasMore,
      count,
    }
  }
)
