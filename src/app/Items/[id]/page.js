import ItemDetail from '../../../components/ItemDetail/ItemDetail';

export default async function ItemDetailPage({ params }) {
  const { id } = await params;
  
  return (
    <div>
      <ItemDetail itemId={id} />
    </div>
  );
}