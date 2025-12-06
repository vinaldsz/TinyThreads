'use client';
// src/app/add-listing/page.js
import Link from 'next/link';
import styles from './page.module.css';
import { useState } from 'react';
import { uploadListingAction } from './actions';

// Standardized size options for kids under 5
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
  { value: '4T', label: '4T (4-5 years)' }
];

// Standardized age range options
const ageRanges = [
  { value: '', label: 'Select age range' },
  { value: '0-6M', label: '0-6 Months' },
  { value: '6-12M', label: '6-12 Months' },
  { value: '1-2Y', label: '1-2 Years' },
  { value: '2-3Y', label: '2-3 Years' },
  { value: '3-5Y', label: '3-5 Years' }
];

/**
 * AddListingPage — page for submitting a new listing.
 * Handles all client-side validation and UX for instant feedback before submit.
 * (Validation logic mirrors server-side rules in ./actions.js.)
 */
export default function AddListingPage() {
  const [fileErr, setFileErr] = useState('');
  const [titleErr, setTitleErr] = useState('');
  //const [sellerNameErr, setSellerNameErr] = useState('');
  const [priceErr, setPriceErr] = useState('');
  const [categoryErr, setCategoryErr] = useState('');
  const [conditionErr, setConditionErr] = useState('');
  const [sizeErr, setSizeErr] = useState('');
  const [ageRangeErr, setAgeRangeErr] = useState('');
  const [isDonation, setIsDonation] = useState(false);

  const [formVersion, setFormVersion] = useState(0);

  const [fileInputs, setFileInputs] = useState([0]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // add state to track field values
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [size, setSize] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationCoords, setLocationCoords] = useState(null);
  const [locError, setLocError] = useState('');
  const [locLoading, setLocLoading] = useState(false);

  // Client-side validation logic (mirrors server rules for instant feedback)
  function validateTitle(value) {
    const v = (value || '').trim();
    if (v.length < 3 || v.length > 150)
      return 'Title must be 3–150 characters.';
    return '';
  }

  function validatePrice(value) {
    const v = String(value ?? '').trim();
    if (!v) return 'Enter a valid price (e.g., 12.99).';
    const num = Number(v);
    if (!Number.isFinite(num) || num < 0)
      return 'Enter a valid price (e.g., 12.99).';
    // allow up to 2 decimals
    if (!/^\d+(?:\.\d{1,2})?$/.test(v)) return 'Use up to 2 decimal places.';
    return '';
  }

  function handleDonationToggle(e) {
    const checked = e.target.checked;
    setIsDonation(checked);

    if (checked) {
      // When marked as donation, lock price to 0
      setPrice('0');
      setPriceErr('');
    } else {
      // When unchecking donation, clear price so user can enter a value
      setPrice('');
    }

    setFormVersion((v) => v + 1);
  }

  function validateRequiredSelect(value, label) {
    if (!value) return `Please select a ${label}.`;
    return '';
  }

  // Field event handlers (validate on blur/change)
  function handleTitleChange(e) {
    const value = e.target.value;
    setTitle(value);
    if (titleErr) setTitleErr(validateTitle(value));
  }

  function handlePriceChange(e) {
    const value = e.target.value;
    setPrice(value);
    setFormVersion((v) => v + 1);
    if (priceErr) setPriceErr(validatePrice(value));
  }

  function handleCategoryChange(e) {
    const value = e.target.value;
    setCategory(value);
    setFormVersion((v) => v + 1);
    setCategoryErr(validateRequiredSelect(value, 'category'));
  }

  function handleConditionChange(e) {
    const value = e.target.value;
    setCondition(value);
    setFormVersion((v) => v + 1);
    setConditionErr(validateRequiredSelect(value, 'condition'));
  }

  function handleSizeChange(e) {
    const value = e.target.value;
    setSize(value);
    setFormVersion((v) => v + 1);
    setSizeErr(validateRequiredSelect(value, 'size'));
  }

  function handleAgeRangeChange(e) {
    const value = e.target.value;
    setAgeRange(value);
    setFormVersion((v) => v + 1);
    setAgeRangeErr(validateRequiredSelect(value, 'age range'));
  }

  function handleLocationChange(e) {
    const value = e.target.value;
    setLocationCity(value);
    setFormVersion((v) => v + 1);
  }

  function handleUseMyLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocError('Location is not supported on this device.');
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(3));
        const lng = Number(pos.coords.longitude.toFixed(3));

        setLocationCoords({ lat, lng });
        setLocError('');
        setLocLoading(false);
        setFormVersion((v) => v + 1);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocError('Could not get your location.');
        setLocLoading(false);
      },
      { timeout: 8000 },
    );
  }

  function handleTitleBlur(e) {
    setTitleErr(validateTitle(e.target.value));
    setFormVersion((v) => v + 1);
  }

  // Seller name is provided by server-side session; client-side blur handler removed.

  function handlePriceBlur(e) {
    setPriceErr(validatePrice(e.target.value));
    setFormVersion((v) => v + 1);
  }

  // Global form validation state — disables Submit when any required field fails validation
  function isFormInvalid() {
    // Use current state values
    const titleVal = title.trim();
    const priceVal = price.trim();
    const categoryVal = category;
    const conditionVal = condition;
    const sizeVal = size;
    const ageRangeVal = ageRange;
    const locationVal = locationCity.trim();
    const hasCoords = locationCoords != null;

    const hasAllFields =
      titleVal.length > 0 &&
      priceVal.length > 0 &&
      categoryVal.length > 0 &&
      conditionVal.length > 0 &&
      sizeVal.length > 0 &&
      ageRangeVal.length > 0 &&
      locationVal.length > 0 &&
      hasCoords &&
      selectedFiles.length > 0;

    if (!hasAllFields) {
      return true;
    }

    // touch formVersion so React knows this depends on validation-triggering changes
    void formVersion;

    return Boolean(
      validateTitle(titleVal) ||
        validatePrice(priceVal) ||
        validateRequiredSelect(categoryVal, 'category') ||
        validateRequiredSelect(conditionVal, 'condition') ||
        validateRequiredSelect(sizeVal, 'size') ||
        validateRequiredSelect(ageRangeVal, 'age range') ||
        !locationVal ||
        !hasCoords ||
        selectedFiles.length === 0,
    );
  }

  // File upload validation: enforce 5 MB limit per file client-side for UX (server revalidates)
  const MAX_SIZE_PER_FILE = 5 * 1024 * 1024; // 5 MB per file
  function handleFileChange(e, inputId) {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      // Remove any files previously selected for this input
      setSelectedFiles((prev) => prev.filter((f) => f.inputId !== inputId));
      setFileErr('');
      setFormVersion((v) => v + 1);
      return;
    }

    const tooLarge = files.find((file) => file.size > MAX_SIZE_PER_FILE);
    const invalidType = files.find(
      (file) =>
        file.type &&
        !['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(
          file.type,
        ),
    );

    if (tooLarge) {
      setFileErr('File above 5 MB, please try again.');
    } else if (invalidType) {
      setFileErr('Unsupported file type. Please upload JPG, PNG, or GIF.');
    } else {
      setFileErr('');
    }

    // Track file names for display (actual files are kept by the inputs for submission)
    setSelectedFiles((prev) => {
      const withoutThisInput = prev.filter((f) => f.inputId !== inputId);
      const newEntries = files.map((file) => ({
        inputId,
        name: file.name,
      }));
      return [...withoutThisInput, ...newEntries];
    });
    setFormVersion((v) => v + 1);
  }

  function handleFileBlur() {}

  function handleAddMoreFiles() {
    setFileInputs((prev) => {
      const nextId = prev.length ? prev[prev.length - 1] + 1 : 0;
      return [...prev, nextId];
    });
  }

  function handleRemoveFileInput(inputId) {
    // Don't remove the last remaining input; always keep at least one
    setFileInputs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((id) => id !== inputId);
    });

    // Remove any files tracked for this input
    setSelectedFiles((prev) => {
      const next = prev.filter((f) => f.inputId !== inputId);
      // If no files remain selected at all, clear any file-related error
      if (next.length === 0) {
        setFileErr('');
      }
      return next;
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.backSection}>
        <Link href="/" className={styles.backButton}>
          ← Back to Browse
        </Link>
      </div>
      <div className={styles.container}>
        {/* Form Section */}
        <section className={styles.formSection}>
          <form
            id="addListingForm"
            className={styles.listingForm}
            action={uploadListingAction}
          >
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Organic Cotton Onesie - Pink"
                required
                onBlur={handleTitleBlur}
                onChange={handleTitleChange}
              />
              {titleErr && (
                <p
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {titleErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                required
                onChange={handleCategoryChange}
              >
                <option value="">Select category</option>
                <option value="clothing">Clothing</option>
                <option value="toys">Toys</option>
                <option value="books">Books</option>
                <option value="gear">Baby Gear</option>
              </select>
              {categoryErr && (
                <p
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {categoryErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="size">Size</label>
              <select
                id="size"
                name="size"
                required
                value={size}                
                onChange={handleSizeChange}
              >
                {kidsSizes.map(sizeOption => (
                  <option key={sizeOption.value} value={sizeOption.value}>
                    {sizeOption.label}
                  </option>
                ))}
              </select>
              {sizeErr && (
                <p
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {sizeErr}
              </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ageRange">Age Range</label>
              <select
                id="ageRange"
                name="ageRange"
                required
                value={ageRange}
                onChange={handleAgeRangeChange}
              >
                {ageRanges.map(ageOption => (
                  <option key={ageOption.value} value={ageOption.value}>
                    {ageOption.label}
                  </option>
                ))}
              </select>
              {ageRangeErr && (
                <p
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {ageRangeErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <p className={styles.fieldHint}>
                Enter your city/area for the listing, then tap “Use my current
                location” so we can sort by distance. Both are required.
              </p>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="City, State (e.g., Fremont, CA)"
                value={locationCity}
                onChange={handleLocationChange}
              />
              <button
                type="button"
                onClick={handleUseMyLocation}
                className={`${styles.locationButton} ${
                  locationCoords && !locError
                    ? styles.locationButtonSuccess
                    : ''
                }`}
                disabled={locLoading}
              >
                {locLoading ? 'Detecting location…' : 'Use my current location'}
              </button>
              {/* Hidden fields for coordinates, used by uploadListingAction */}
              <input
                type="hidden"
                name="lat"
                value={locationCoords?.lat ?? ''}
              />
              <input
                type="hidden"
                name="lng"
                value={locationCoords?.lng ?? ''}
              />
              {locError && (
                <p role="alert" className={styles.locationError}>
                  {locError}
                </p>
              )}
              {locationCoords && !locError && (
                <p className={styles.locationDetected}>
                  Location access enabled. Your city and current location are
                  now used together to help nearby parents find this listing.
                </p>
              )}
              {(!locationCity.trim() || !locationCoords) && (
                <p className={styles.locationRequired}>
                  To add a listing, please enter your city and tap “Use my
                  current location”.
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                name="condition"
                required
                onChange={handleConditionChange}
              >
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
              {conditionErr && (
                <p
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {conditionErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="donation">
                <input
                  id="donation"
                  name="donation"
                  type="checkbox"
                  onChange={handleDonationToggle}
                />
                &nbsp;Mark as Donation (Price becomes $0)
              </label>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price ($)</label>
              <input
                id="price"
                name="price"
                disabled={isDonation}
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 20.00"
                required
                value={price}
                onBlur={handlePriceBlur}
                onChange={handlePriceChange}
              />
              {priceErr && (
                <p
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {priceErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Add a short description of the item..."
                rows="4"
              ></textarea>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Upload Files</label>

              {fileInputs.map((id, index) => (
                <div key={id} className={styles.fileInputRow}>
                  <input
                    id={index === 0 ? 'image' : `image-${id}`}
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, id)}
                    onBlur={handleFileBlur}
                    aria-describedby="imageError"
                    required={index === 0}
                  />
                  {fileInputs.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeFileInputBtn}
                      onClick={() => handleRemoveFileInput(id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className={styles.addMoreFilesBtn}
                onClick={handleAddMoreFiles}
              >
                + Add more files
              </button>

              {selectedFiles.length > 0 && (
                <div className={styles.fileSummary}>
                  <p>
                    {selectedFiles.length} file
                    {selectedFiles.length > 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              {selectedFiles.length === 0 && (
                <p
                  id="imageError"
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  Please upload at least one image.
                </p>
              )}

              {fileErr && (
                <p
                  role="alert"
                  style={{
                    color: '#c62828',
                    marginTop: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  {fileErr}
                </p>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isFormInvalid()}
                //disabled={false}
              >
                Add Listing
              </button>
              <Link href="/" className={styles.cancelBtn}>
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
