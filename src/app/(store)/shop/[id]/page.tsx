import { redirect } from "next/navigation"

/**
 * Legacy route: older links used /shop/[id]. The canonical product page is /product/[id].
 */
export default async function ShopProductLegacyRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/product/${id}`)
}
