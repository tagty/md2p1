import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useMutation, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getPresentation from "app/presentations/queries/getPresentation"
import updatePresentation from "app/presentations/mutations/updatePresentation"
import { PresentationForm, FORM_ERROR } from "app/presentations/components/PresentationForm"

export const EditPresentation = () => {
  const router = useRouter()
  const presentationId = useParam("presentationId", "number")
  const [presentation, { setQueryData }] = useQuery(getPresentation, { id: presentationId })
  const [updatePresentationMutation] = useMutation(updatePresentation)

  return (
    <>
      <Head>
        <title>Edit Presentation {presentation.id}</title>
      </Head>

      <div>
        <h1>Edit Presentation {presentation.id}</h1>
        <pre>{JSON.stringify(presentation)}</pre>

        <PresentationForm
          submitText="Update Presentation"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdatePresentation}
          initialValues={presentation}
          onSubmit={async (values) => {
            try {
              const updated = await updatePresentationMutation({
                id: presentation.id,
                ...values,
              })
              await setQueryData(updated)
              router.push(Routes.ShowPresentationPage({ presentationId: updated.id }))
            } catch (error) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </div>
    </>
  )
}

const EditPresentationPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditPresentation />
      </Suspense>

      <p>
        <Link href={Routes.PresentationsPage()}>
          <a>Presentations</a>
        </Link>
      </p>
    </div>
  )
}

EditPresentationPage.authenticate = true
EditPresentationPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditPresentationPage
