import { getItemById } from '@/services/itemService';
import EditListingForm from './EditListingForm';

export default async function EditListingPage(props) {
  // In Next.js 16, params is a Promise in async server components
  const params = await props.params;
  const { id } = params || {};

  if (!id) {
    throw new Error('Missing item id in route params for EditListingPage');
  }

  const item = await getItemById(id);

  if (!item) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Listing not found</h1>
        <p>This listing may have been removed or the ID is invalid.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Edit Listing</h1>
      <EditListingForm item={item} />
    </div>
  );
}
