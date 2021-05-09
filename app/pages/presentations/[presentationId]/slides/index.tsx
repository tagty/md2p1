import React, { Suspense } from "react"
import {
  Head,
  usePaginatedQuery,
  useRouter,
  useParam,
  BlitzPage,
  useQuery,
  Routes,
  Link,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getSlides from "app/slides/queries/getSlides"
import getBlockH1 from "app/block-h1s/queries/getBlockH1"
import getBlockList from "app/block-lists/queries/getBlockList"

const ITEMS_PER_PAGE = 1

const BlockH1 = ({ block }) => {
  const [buildable] = useQuery(getBlockH1, { id: block.buildableId })
  return <h1>{buildable.text}</h1>
}

const BlockList = ({ block }) => {
  const [buildable] = useQuery(getBlockList, { id: block.buildableId })
  return <li>{buildable.text}</li>
}

export const SlidesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const presentationId = useParam("presentationId", "number")
  const [{ slides, hasMore }] = usePaginatedQuery(getSlides, {
    where: { presentation: { id: presentationId } },
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () =>
    router.push({ query: { presentationId: presentationId, page: page - 1 } })
  const goToNextPage = () =>
    router.push({ query: { presentationId: presentationId, page: page + 1 } })

  const slide = slides[0]
  const blocks = slide.blocks.sort((a, b) => a.number - b.number)

  return (
    <div>
      <div>
        {blocks.map((block) => (
          <div key={block.id}>
            {block.buildableType === "BlockH1" ? (
              <BlockH1 block={block} />
            ) : (
              <BlockList block={block} />
            )}
          </div>
        ))}
      </div>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const SlidesPage: BlitzPage = () => {
  return (
    <>
      <Head>
        <title>Slides</title>
      </Head>

      <p>
        <Link href={Routes.PresentationsPage()}>
          <a>Presentations</a>
        </Link>
      </p>

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <SlidesList />
        </Suspense>
      </div>
    </>
  )
}

SlidesPage.authenticate = true
SlidesPage.getLayout = (page) => <Layout>{page}</Layout>

export default SlidesPage
