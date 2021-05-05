import { Suspense } from "react"
import { Head, Link, usePaginatedQuery, useRouter, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getPresentations from "app/presentations/queries/getPresentations"

const ITEMS_PER_PAGE = 100

export const PresentationsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ presentations, hasMore }] = usePaginatedQuery(getPresentations, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {presentations.map((presentation) => (
          <li key={presentation.id}>
            <Link href={Routes.ShowPresentationPage({ presentationId: presentation.id })}>
              <a>{presentation.title}</a>
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const PresentationsPage: BlitzPage = () => {
  return (
    <>
      <Head>
        <title>Presentations</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewPresentationPage()}>
            <a>Create Presentation</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <PresentationsList />
        </Suspense>
      </div>
    </>
  )
}

PresentationsPage.authenticate = true
PresentationsPage.getLayout = (page) => <Layout>{page}</Layout>

export default PresentationsPage
