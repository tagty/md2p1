import { Link, useRouter, useMutation, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import createPresentation from "app/presentations/mutations/createPresentation"
import { PresentationForm, FORM_ERROR } from "app/presentations/components/PresentationForm"

const NewPresentationPage: BlitzPage = () => {
  const router = useRouter()
  const [createPresentationMutation] = useMutation(createPresentation)

  return (
    <div>
      <h1>Create New Presentation</h1>

      <PresentationForm
        submitText="Create Presentation"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreatePresentation}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const presentation = await createPresentationMutation(values)
            router.push(`/presentations/${presentation.id}`)
          } catch (error) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.PresentationsPage()}>
          <a>Presentations</a>
        </Link>
      </p>
    </div>
  )
}

NewPresentationPage.authenticate = true
NewPresentationPage.getLayout = (page) => <Layout title={"Create New Presentation"}>{page}</Layout>

export default NewPresentationPage
