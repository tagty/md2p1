import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useParam, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getPresentation from "app/presentations/queries/getPresentation"
import deletePresentation from "app/presentations/mutations/deletePresentation"

export const Presentation = () => {
  const router = useRouter()
  const presentationId = useParam("presentationId", "number")
  const [deletePresentationMutation] = useMutation(deletePresentation)
  const [presentation] = useQuery(getPresentation, { id: presentationId })

  return (
    <>
      <Head>
        <title>Presentation {presentation.id}</title>
      </Head>

      <div>
        <h1>Presentation {presentation.id}</h1>
        <pre>{JSON.stringify(presentation, null, 2)}</pre>

        <Link href={Routes.EditPresentationPage({ presentationId: presentation.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deletePresentationMutation({ id: presentation.id })
              router.push(Routes.PresentationsPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowPresentationPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.PresentationsPage()}>
          <a>Presentations</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Presentation />
      </Suspense>
    </div>
  )
}

ShowPresentationPage.authenticate = true
ShowPresentationPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowPresentationPage
