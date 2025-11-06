// src/components/__tests__/ItemCard.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import ItemCard from "../ItemCard/ItemCard";
import Image from "next/image";

// Mock Next.js Image component (FIXED VERSION)
jest.mock("next/image", () => {
  return function MockImage({
    src,
    alt,
    fill,
    onLoadingComplete,
    onError,
    ...props
  }) {
    return (
      <Image
        src={src}
        alt={alt}
        width={400}
        height={400}
        {...props}
        // Only add data-fill if fill prop exists
        {...(fill ? { "data-fill": fill } : {})}
        onLoad={() => onLoadingComplete && onLoadingComplete()}
        onError={() => onError && onError()}
      />
    );
  };
});

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock data that matches your component's expected props
const mockItem = {
  id: "123",
  title: "Baby Onesie 6M",
  price: 5.99,
  condition: "Like New",
  category: "Clothing",
  ageRange: "6M",
  imageUrl: "/test-image.jpg",
  description: "Cute baby onesie, barely worn",
};

describe("ItemCard Component", () => {
  // Mock router function
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    useRouter.mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
  });

  test("renders item card with basic information", () => {
    // Arrange & Act
    render(<ItemCard item={mockItem} />);

    // Assert - Check if key elements are rendered
    expect(screen.getByText("Baby Onesie 6M")).toBeInTheDocument();
    expect(screen.getByText("$5.99")).toBeInTheDocument();
    expect(screen.getByText("Like New")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("6M")).toBeInTheDocument();
    expect(
      screen.getByText("Cute baby onesie, barely worn")
    ).toBeInTheDocument();
  });

  test("displays correct category icon for clothing", () => {
    render(<ItemCard item={mockItem} />);

    // Should show clothing emoji
    expect(screen.getByText("👕")).toBeInTheDocument();
  });

  test("navigates to item detail when clicked", () => {
    render(<ItemCard item={mockItem} />);

    // Find and click the card
    const card = screen.getByText("Baby Onesie 6M").closest("div");
    fireEvent.click(card);

    // Assert navigation was called
    expect(mockPush).toHaveBeenCalledWith("/Items/123");
  });

  test("shows View Details button", () => {
    render(<ItemCard item={mockItem} />);

    expect(screen.getByText("View Details")).toBeInTheDocument();
  });
});
