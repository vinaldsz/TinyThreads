import ItemDetail from '@/components/ItemDetail/ItemDetail';

export default async function ItemDetailPage({ params }) {
  const { id } = await params; // in Next 15/16 params can be a Promise
  return <ItemDetail itemId={id} />;
}