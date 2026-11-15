import ElementSpinner from '@/app/components/ElementSpinner'

/**
 * Site-wide loading state: Next wraps every route below app/ in a Suspense boundary and shows this while a page is loading.
 * A route that wants its own (say, a page with a heavier skeleton) can add a loading.tsx beside its page.tsx and that one wins for that route.
 */
export default function Loading() {
    return (
        <div className="route-loading">
            <ElementSpinner />
        </div>
    )
}