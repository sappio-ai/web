import ProcessingStatus from '@/components/materials/ProcessingStatus'

export default async function MaterialStatusPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProcessingStatus materialId={id} />
}
