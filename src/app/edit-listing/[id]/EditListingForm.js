'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateListingAction } from './actions';
import styles from './EditListingForm.module.css';

const ALLOWED_CATEGORIES = ['clothing', 'toys', 'books', 'gear'];
const ALLOWED_CONDITIONS = ['new', 'like-new', 'good', 'fair'];

const kidsSizes = [
  { value: '', label: 'Select size' },
  { value: 'NB', label: 'Newborn (0-3M)' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '9M', label: '9 Months' },
  { value: '12M', label: '12 Months' },
  { value: '18M', label: '18 Months' },
  { value: '24M', label: '24 Months' },
  { value: '2T', label: '2T (2-3 years)' },
  { value: '3T', label: '3T (3-4 years)' },
  { value: '4T', label: '4T (4-5 years)' },
];

const ageRanges = [
  { value: '', label: 'Select age range' },
  { value: '0-6M', label: '0-6 Months' },
  { value: '6-12M', label: '6-12 Months' },
  { value: '1-2Y', label: '1-2 Years' },
  { value: '2-3Y', label: '2-3 Years' },
  { value: '3-5Y', label: '3-5 Years' },
];

export default function EditListingForm({ item }) {
  const router = useRouter();

  const initialPrice =
    item.price !== null && item.price !== undefined ? String(item.price) : '';

  const initialIsDonation = item.price === 0;

  const initialLat =
    item.geoLocation &&
    Array.isArray(item.geoLocation.coordinates) &&
    item.geoLocation.coordinates.length === 2
      ? item.geoLocation.coordinates[1]
      : null;

  const initialLng =
    item.geoLocation &&
    Array.isArray(item.geoLocation.coordinates) &&
    item.geoLocation.coordinates.length === 2
      ? item.geoLocation.coordinates[0]
      : null;

  const [formState, setFormState] = useState({
    title: item.title || '',
    price: initialPrice,
    size: item.size || '',
    condition: item.condition || '',
    description: item.description || '',
    category: item.category || '',
    ageRange: item.ageRange || '',
  });

  const [locationCity, setLocationCity] = useState(item.location || '');
  const [locationCoords, setLocationCoords] = useState(
    initialLat !== null && initialLng !== null
      ? {
          lat: Number(initialLat).toFixed(3),
          lng: Number(initialLng).toFixed(3),
        }
      : null,
  );

  const [isDonation, setIsDonation] = useState(initialIsDonation);
  const [existingImages, setExistingImages] = useState(item.imageUrls || []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileErr, setFileErr] = useState('');
  const [locError, setLocError] = useState('');
  const [locLoading, setLocLoading] = useState(false);

  // dynamic file inputs for new uploads (like Add Listing)
  const [fileInputs, setFileInputs] = useState([{ id: 0 }]);
  const [nextFileInputId, setNextFileInputId] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'price') {
      setFormState((prev) => ({
        ...prev,
        price: value,
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    setLocationCity(e.target.value);
  };

  const handleDonationToggle = (e) => {
    const checked = e.target.checked;
    setIsDonation(checked);

    setFormState((prev) => {
      // When donation is checked, force price to "0"
      if (checked) {
        return { ...prev, price: '0' };
      }
      // When unchecking donation, allow user to re-enter price
      if (!checked && prev.price === '0') {
        return { ...prev, price: '' };
      }
      return prev;
    });
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocError('Geolocation is not supported in this browser.');
      return;
    }

    setLocLoading(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationCoords({
          lat: latitude.toFixed(3),
          lng: longitude.toFixed(3),
        });
        setLocLoading(false);
      },
      (err) => {
        console.error('Error fetching location:', err);
        setLocError(
          'Unable to fetch your location. Please allow access or type it manually.',
        );
        setLocLoading(false);
      },
    );
  };

  const handleRemoveExistingImage = (urlToRemove) => {
    setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleFileChange = (e, inputId) => {
    setFileErr('');
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[inputId];
        return copy;
      });
      return;
    }

    const MAX_BYTES = 5 * 1024 * 1024;

    for (const file of files) {
      if (!file.type || !file.type.startsWith('image/')) {
        setFileErr('Only image files are allowed.');
        e.target.value = '';
        setSelectedFiles((prev) => {
          const copy = { ...prev };
          delete copy[inputId];
          return copy;
        });
        return;
      }
      if (file.size > MAX_BYTES) {
        setFileErr('Each image must be smaller than 5 MB.');
        e.target.value = '';
        setSelectedFiles((prev) => {
          const copy = { ...prev };
          delete copy[inputId];
          return copy;
        });
        return;
      }
    }

    const label =
      files.length === 1
        ? files[0].name
        : `${files[0].name} (+${files.length - 1} more)`;

    setSelectedFiles((prev) => ({
      ...prev,
      [inputId]: label,
    }));
  };

  const handleAddFileInput = () => {
    setFileInputs((prev) => [...prev, { id: nextFileInputId }]);
    setNextFileInputId((id) => id + 1);
  };

  const handleRemoveFileInput = (inputId) => {
    setFileInputs((prev) => prev.filter((input) => input.id !== inputId));
    setSelectedFiles((prev) => {
      const copy = { ...prev };
      delete copy[inputId];
      return copy;
    });
  };

  const validateBeforeSubmit = (formElement) => {
    // Reset errors
    setLocError('');
    setFileErr('');

    if (!formState.title.trim() || formState.title.trim().length < 3) {
      setErrorMsg('Title must be at least 3 characters long.');
      return false;
    }

    if (!isDonation) {
      const priceStr = (formState.price || '').trim();
      const priceNum = Number(priceStr);

      if (!priceStr || !Number.isFinite(priceNum) || priceNum < 0) {
        setErrorMsg('Please enter a valid price.');
        return false;
      }

      if (!/^\d+(?:\.\d{1,2})?$/.test(priceStr)) {
        setErrorMsg('Use up to 2 decimal places for the price.');
        return false;
      }
    }

    if (!locationCity.trim()) {
      setLocError('Please enter your city or neighborhood.');
      return false;
    }

    // Only require fresh coordinates if the user has changed the location text.
    // If the location is unchanged, we keep using the existing geoLocation
    // stored on the listing (handled on the server).
    const originalLoc = (item.location || '').trim();
    const locationChanged =
      locationCity.trim() && locationCity.trim() !== originalLoc;

    if (locationChanged && !locationCoords) {
      setLocError(
        'Since you updated your location, please use "Use my current location" so we can store new coordinates.',
      );
      return false;
    }

    // Determine if there are any existing images still attached to the form
    // by checking the hidden existingImageUrls inputs rather than only React state.
    let hasExistingImages = false;
    const existingInputs = formElement.elements.existingImageUrls;

    if (existingInputs) {
      if (existingInputs.length === undefined) {
        // Single hidden input
        hasExistingImages = true;
      } else if (existingInputs.length > 0) {
        hasExistingImages = true;
      }
    }

    // Check all file inputs (may be one or many with name="image")
    const fileInputsElements = formElement.elements.image;
    let hasNewFiles = false;

    if (fileInputsElements) {
      if (fileInputsElements.length === undefined) {
        hasNewFiles =
          fileInputsElements.files && fileInputsElements.files.length > 0;
      } else {
        hasNewFiles = Array.from(fileInputsElements).some(
          (inputEl) => inputEl.files && inputEl.files.length > 0,
        );
      }
    }

    if (!hasExistingImages && !hasNewFiles) {
      setFileErr('Please keep at least one image or upload a new one.');
      return false;
    }

    // Basic category/condition presence checks
    if (!formState.category) {
      setErrorMsg('Please select a category.');
      return false;
    }

    if (!formState.condition) {
      setErrorMsg('Please select a condition.');
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const formElement = e.currentTarget;

    if (!validateBeforeSubmit(formElement)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData(formElement);

      // Ensure id is present
      formData.set('id', item._id);

      // Use normalized values for consistency with server validations
      formData.set('title', formState.title.trim());
      formData.set('price', formState.price || '');
      formData.set('size', formState.size || '');
      formData.set('condition', formState.condition || '');
      formData.set('description', formState.description || '');
      formData.set('category', formState.category || '');
      formData.set('ageRange', formState.ageRange || '');
      formData.set('location', locationCity.trim());
      formData.set('donation', isDonation ? 'true' : 'false');

      if (locationCoords) {
        formData.set('lat', String(locationCoords.lat));
        formData.set('lng', String(locationCoords.lng));
      }

      // Clear any existingImageUrls from previous submissions,
      // then append the current remaining images.
      if (formData.delete) {
        formData.delete('existingImageUrls');
      }
      existingImages.forEach((url) => {
        formData.append('existingImageUrls', url);
      });

      const result = await updateListingAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }

      router.push(`/Items/${item._id}`);
    } catch (err) {
      console.error('Error updating listing:', err);
      setErrorMsg('Something went wrong while saving. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Edit listing
      </h2>

      {errorMsg && <p className={styles.errorBox}>{errorMsg}</p>}

      <input type="hidden" name="id" value={item._id} />

      <div className={styles.field}>
        <label className={styles.label}>
          Title
          <input
            name="title"
            value={formState.title}
            onChange={handleChange}
            required
            maxLength={150}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formState.price}
              onChange={handleChange}
              required={!isDonation}
              disabled={isDonation}
              className={styles.input}
            />
          </label>
        </div>

        <div className={styles.fieldCheckbox}>
          <label className={styles.checkboxLabel}>
            <input
              id="donation"
              name="donation"
              type="checkbox"
              checked={isDonation}
              onChange={handleDonationToggle}
            />
            Donate this item (price will be set to $0)
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Size
          <select
            name="size"
            value={formState.size}
            onChange={handleChange}
            className={styles.select}
          >
            {kidsSizes.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Condition
          <select
            name="condition"
            value={formState.condition}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select condition</option>
            {ALLOWED_CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond === 'like-new'
                  ? 'Like new'
                  : cond.charAt(0).toUpperCase() + cond.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Category
          <select
            name="category"
            value={formState.category}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select category</option>
            {ALLOWED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Age range
          <select
            name="ageRange"
            value={formState.ageRange}
            onChange={handleChange}
            className={styles.select}
          >
            {ageRanges.map((opt) => (
              <option key={opt.value || 'empty'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Location
          <input
            name="location"
            value={locationCity}
            onChange={handleLocationChange}
            className={styles.input}
            placeholder="e.g. San Leandro, CA"
            required
          />
        </label>

        <div className={styles.locationControls}>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className={`${styles.locationButton} ${
              locationCoords ? styles.locationButtonSuccess : ''
            }`}
            disabled={locLoading}
          >
            {locLoading ? 'Detecting location…' : 'Use my current location'}
          </button>
        </div>

        {locError && <p className={styles.locationError}>{locError}</p>}
        {locationCoords && !locError && (
          <p className={styles.locationDetected}>
            Location detected successfully.
          </p>
        )}

        <p className={styles.fieldHint}>
          We use your city and approximate coordinates to sort TinyThreads
          listings by distance.
        </p>

        {/* Hidden fields for server-side geoLocation update */}
        <input type="hidden" name="lat" value={locationCoords?.lat ?? ''} />
        <input type="hidden" name="lng" value={locationCoords?.lng ?? ''} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Description
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            className={styles.textarea}
          />
        </label>
      </div>

      {existingImages.length > 0 && (
        <div className={styles.field}>
          <p className={styles.label}>Current images</p>
          <div className={styles.imageGrid}>
            {existingImages.map((url) => (
              <div key={url} className={styles.imageThumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Existing listing image"
                  className={styles.image}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage(url)}
                  className={styles.removeImageBtn}
                >
                  Remove
                </button>
                <input type="hidden" name="existingImageUrls" value={url} />
              </div>
            ))}
          </div>
          <p className={styles.helpText}>
            These images will stay unless you remove them or upload new ones.
          </p>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Replace / add images</label>

        {fileInputs.map((input) => (
          <div key={input.id} className={styles.fileInputRow}>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => handleFileChange(e, input.id)}
            />
            {selectedFiles[input.id] && (
              <span className={styles.fileSummary}>
                {selectedFiles[input.id]}
              </span>
            )}
            {fileInputs.length > 1 && (
              <button
                type="button"
                className={styles.removeFileInputBtn}
                onClick={() => handleRemoveFileInput(input.id)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className={styles.addMoreFilesBtn}
          onClick={handleAddFileInput}
        >
          Add more photos
        </button>

        <p className={styles.helpText}>
          If you select new images, the server will combine them with the
          remaining images. At least one image is required for every listing.
        </p>
        {fileErr && <p className={styles.fieldError}>{fileErr}</p>}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
        }}
      >
        <button
          type="button"
          onClick={() => router.push(`/Items/${item._id}`)}
          disabled={isSubmitting}
          className={styles.cancelBtn}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
