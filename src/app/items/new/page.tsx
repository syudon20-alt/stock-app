import ItemForm from "@/components/ItemForm";

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<{ barcode?: string; name?: string }>;
}) {
  const params = await searchParams;

  return (
    <ItemForm
      mode="create"
      initialBarcode={params.barcode}
      initialName={params.name}
    />
  );
}
