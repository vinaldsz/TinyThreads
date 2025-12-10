import { getItemById } from '@/services/itemService';
import EditListingForm from './EditListingForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function EditListingPage(props) {
  const params = await props.params;
  const { id } = params || {};

  if (!id) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Listing not found</h2>
        <p>Missing listing ID in the URL.</p>
      </div>
    );
  }

  // Fetch listing
  const item = await getItemById(id);

  if (!item) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Listing not found</h2>
        <p>This listing may have been removed or does not exist.</p>
      </div>
    );
  }

  // Fetch user session
  const session = await getServerSession(authOptions);

  // Authorization check: only the seller can access this page
  if (
    !session ||
    !session.user ||
    String(session.user.id) !== String(item.sellerId)
  ) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Not authorized to edit this listing</h2>
        <p>You can only edit listings that you created.</p>
      </div>
    );
  }

  // Authorized → render the edit form
  return (
    <div style={{ padding: '2rem' }}>
      <EditListingForm item={item} />
    </div>
  );
}
