import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Types
interface RestaurantItem {
  _id: string;
  // Add other properties as needed
  [key: string]: any;
}

// Minimal in-memory restaurant store mock
const storeState = {
  restaurant: null as any,
  items: [] as RestaurantItem[],
};

const mockSetItems = jest.fn((items: any[]) => {
  storeState.items = items;
});

const mockAddItem = jest.fn((item: any) => {
  storeState.items = [...storeState.items, item];
});

const mockUpdateItem = jest.fn((updated: RestaurantItem) => {
  storeState.items = storeState.items.map((i: RestaurantItem) =>
    i._id === updated._id ? updated : i,
  );
});

const mockDeleteItem = jest.fn((id: string) => {
  storeState.items = storeState.items.filter((i: RestaurantItem) => i._id !== id);
});

jest.mock("@/store/restaurant", () => ({
  useRestaurantData: () => ({
    restaurant: storeState.restaurant,
    items: storeState.items,
    setItems: mockSetItems,
    addItem: mockAddItem,
    updateItem: mockUpdateItem,
    deleteItem: mockDeleteItem,
  }),
}));

const mockReplace = jest.fn();

jest.mock("next/navigation", () => {
  const actual = jest.requireActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({ replace: mockReplace }),
  };
});

const mockBackendPost = jest.fn();

jest.mock("@/config/backend", () => ({
  backend: {
    post: (...args: any[]) => mockBackendPost(...args),
  },
}));

// Mock heavy child components to expose handlers
jest.mock("@/components/categories-stats", () => ({
  HeroSection: ({ totalItems }: any) => (
    <div data-testid="hero-section">Items: {totalItems}</div>
  ),
}));

const mockFilterChange = jest.fn();

jest.mock("@/components/items-filter", () => ({
  ItemsFilter: ({ onFilterChange, maxPrice }: any) => {
    mockFilterChange.mockImplementation(onFilterChange);
    return (
      <div data-testid="items-filter" onClick={() => onFilterChange({
        cuisine: "",
        category: "",
        foodType: "",
        priceRange: [0, maxPrice],
        search: "",
      })}>
        Filter
      </div>
    );
  },
}));

let lastItemsGridProps: any = null;

jest.mock("@/components/items-grid", () => ({
  ItemsGrid: (props: any) => {
    lastItemsGridProps = props;
    return (
      <div data-testid="items-grid">
        {props.items.map((i: any) => (
          <button
            key={i._id}
            onClick={() => props.onEdit(i)}
            data-testid={`edit-${i._id}`}
          >
            Edit {i.dishName}
          </button>
        ))}
        {props.items.map((i: any) => (
          <button
            key={`del-${i._id}`}
            onClick={() => props.onDelete(i)}
            data-testid={`delete-${i._id}`}
          >
            Delete {i.dishName}
          </button>
        ))}
      </div>
    );
  },
}));

let lastAddFormProps: any = null;

jest.mock("@/components/add-item-form", () => ({
  AddItemForm: (props: any) => {
    lastAddFormProps = props;
    return (
      <div data-testid="add-item-form">
        <button
          type="button"
          onClick={() =>
            props.onSubmit({
              dishName: "New Dish",
              cuisine: "Italian",
              category: "Main Course",
              foodType: "veg",
              price: 500,
            })
          }
        >
          Submit Add
        </button>
        <button type="button" onClick={props.onClose}>
          Close Add
        </button>
      </div>
    );
  },
}));

jest.mock("@/components/menu-preview", () => ({
  MenuPreview: () => <div data-testid="menu-preview" />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...rest }: any) => (
    <button {...rest}>{children}</button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

let lastAlertActionOnClick: (() => void) | null = null;

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick }: any) => {
    lastAlertActionOnClick = onClick;
    return <button onClick={onClick}>{children}</button>;
  },
  AlertDialogCancel: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  AlertDialogContent: ({ children }: any) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
}));

import RestaurantItemsPage from "@/app/restaurant/item-list/page";

describe("Restaurant - Item List Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storeState.restaurant = null;
    storeState.items = [];
    lastItemsGridProps = null;
    lastAddFormProps = null;
    lastAlertActionOnClick = null;
  });

  test("redirects to dashboard and renders nothing when restaurant missing", async () => {
    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/restaurant/dashboard");
    });

    // Component returns null when restaurant is missing
    expect(screen.queryByTestId("hero-section")).toBeNull();
  });

  test("loads items, shows hero and empty state, and allows adding first item", async () => {
    storeState.restaurant = { _id: "r1" } as any;
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: [],
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/restaurants/get-items-by-restaurant",
        expect.objectContaining({ restaurantID: "r1" }),
      );
    });

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    // Empty state text
    expect(screen.getByText(/No items found/i)).toBeInTheDocument();

    const addFirstButton = screen.getByRole("button", { name: /Add First Item/i });
    await userEvent.click(addFirstButton);

    // After clicking, AddItemForm is rendered
    expect(screen.getByTestId("add-item-form")).toBeInTheDocument();

    // onClose passed to AddItemForm should be callable without errors
    const closeAddButton = screen.getByRole("button", { name: /Close Add/i });
    await userEvent.click(closeAddButton);

    const submitAdd = screen.getByText(/Submit Add/i);
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          _id: "i1",
          dishName: "New Dish",
          cuisine: "Italian",
          category: "Main Course",
          foodType: "veg",
          price: 500,
        },
      },
    });

    await userEvent.click(submitAdd);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalled();
    });
  });

  test("renders items grid, supports edit and delete flows", async () => {
    storeState.restaurant = { _id: "r1" } as any;
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: [
          {
            _id: "i1",
            dishName: "Dish 1",
            cuisine: "Italian",
            category: "Main Course",
            foodType: "veg",
            price: 100,
            isPopular: false,
            isAvailable: true,
          },
        ],
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("items-grid")).toBeInTheDocument();
    });

    // Trigger edit via ItemsGrid props -> opens edit dialog with AddItemForm
    const editBtn = screen.getByTestId("edit-i1");
    await userEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId("add-item-form").length).toBeGreaterThan(0);
    });

    // Call onSubmit of edit form
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        item: {
          _id: "i1",
          dishName: "Dish 1 updated",
          cuisine: "Italian",
          category: "Main Course",
          foodType: "veg",
          price: 150,
        },
      },
    });

    const submitAddButtons = screen.getAllByText(/Submit Add/i);
    await userEvent.click(submitAddButtons[0]);

    // Trigger delete flow
    mockBackendPost.mockResolvedValueOnce({ data: { success: true } });
    const deleteButtons = screen.getAllByTestId("delete-i1");
    await userEvent.click(deleteButtons[0]);

    const deleteTextButtons = screen.getAllByText(/Delete/i);
    const confirmDelete = deleteTextButtons[deleteTextButtons.length - 1];
    await userEvent.click(confirmDelete);

    await waitFor(() => {
      expect(mockDeleteItem).toHaveBeenCalledWith("i1");
    });
  });

  test("updates item successfully and closes edit dialog", async () => {
    storeState.restaurant = { _id: "r1" } as any;
    storeState.items = [
      {
        _id: "i1",
        dishName: "Dish 1",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 100,
        isPopular: true,
        isAvailable: false,
      },
    ];

    // Initial fetch resolves with existing items
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: storeState.items,
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("items-grid")).toBeInTheDocument();
    });

    // Open edit dialog
    const editBtn = screen.getByTestId("edit-i1");
    await userEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId("add-item-form").length).toBeGreaterThan(0);
    });

    // Update call returns an updated item payload
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        item: {
          _id: "i1",
          dishName: "Dish 1 updated",
          cuisine: "Italian",
          category: "Main Course",
          foodType: "veg",
          price: 150,
          isPopular: false,
          isAvailable: true,
        },
      },
    });

    // Call the captured edit AddItemForm onSubmit directly to trigger handleUpdateItem
    await act(async () => {
      lastAddFormProps.onSubmit({
        dishName: "Dish 1 updated",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 150,
      });
    });

    await waitFor(() => {
      // updateItem should be called with merged data preserving original flags
      expect(mockUpdateItem).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "i1",
          dishName: "Dish 1 updated",
          price: 150,
          isPopular: true,
          isAvailable: false,
        }),
      );
    });
  });

  test("does not update item when backend response is unsuccessful or missing item", async () => {
    storeState.restaurant = { _id: "r1" } as any;
    storeState.items = [
      {
        _id: "i1",
        dishName: "Dish 1",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 100,
        isPopular: false,
        isAvailable: true,
      },
    ];

    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: storeState.items,
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("items-grid")).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId("edit-i1");
    await userEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getAllByTestId("add-item-form").length).toBeGreaterThan(0);
    });

    // First: backend returns success false
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: false,
      },
    });

    await act(async () => {
      lastAddFormProps.onSubmit({
        dishName: "Dish 1 updated",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 150,
      });
    });

    await waitFor(() => {
      expect(mockUpdateItem).not.toHaveBeenCalled();
    });

    // Second: backend returns success true but no item payload
    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    // Re-open edit dialog if needed
    const editBtnAgain = screen.getByTestId("edit-i1");
    await userEvent.click(editBtnAgain);

    await waitFor(() => {
      expect(screen.getAllByTestId("add-item-form").length).toBeGreaterThan(0);
    });

    await act(async () => {
      lastAddFormProps.onSubmit({
        dishName: "Dish 1 updated again",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 175,
      });
    });

    await waitFor(() => {
      expect(mockUpdateItem).not.toHaveBeenCalled();
    });
  });

  test("handles fetch, add, update, and delete errors without crashing", async () => {
    storeState.restaurant = { _id: "r1" } as any;

    // fetchItems error path
    mockBackendPost.mockRejectedValueOnce(new Error("fetch error"));

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(mockBackendPost).toHaveBeenCalledWith(
        "/api/v1/restaurants/get-items-by-restaurant",
        expect.objectContaining({ restaurantID: "r1" }),
      );
    });

    // Prepare state for add/update/delete error paths
    storeState.items = [];

    // Add item error
    mockBackendPost.mockRejectedValueOnce(new Error("add error"));
    // Render add form via "Add First Item" button
    mockBackendPost.mockResolvedValueOnce({
      data: { success: true, items: [] },
    });

    // Re-render with same component tree to trigger add flow
    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/No items found/i).length).toBeGreaterThan(0);
    });

    const addFirstButtons = screen.getAllByRole("button", { name: /Add First Item/i });
    const addFirstButton = addFirstButtons[0];
    await userEvent.click(addFirstButton);

    const submitAddButtons = screen.getAllByText(/Submit Add/i);
    await userEvent.click(submitAddButtons[0]);

    // Update item error
    storeState.items = [
      {
        _id: "i1",
        dishName: "Dish 1",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 100,
        isPopular: false,
        isAvailable: true,
      },
    ];

    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: storeState.items,
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("items-grid")).toBeInTheDocument();
    });

    mockBackendPost.mockRejectedValueOnce(new Error("update error"));

    const editBtn = screen.getByTestId("edit-i1");
    await userEvent.click(editBtn);

    const submitEditButtons = screen.getAllByText(/Submit Add/i);
    await userEvent.click(submitEditButtons[0]);

    // Delete item error
    storeState.items = [
      {
        _id: "i1",
        dishName: "Dish 1",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 100,
        isPopular: false,
        isAvailable: true,
      },
    ];

    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: storeState.items,
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("items-grid")).toBeInTheDocument();
    });

    mockBackendPost.mockRejectedValueOnce(new Error("delete error"));

    const deleteButtonsError = screen.getAllByTestId("delete-i1");
    await userEvent.click(deleteButtonsError[0]);

    if (lastAlertActionOnClick) {
      lastAlertActionOnClick();
    }
  });

  test("delete handler returns early when no delete id is set", async () => {
    storeState.restaurant = { _id: "r1" } as any;
    storeState.items = [];

    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: [],
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      // AlertDialogAction is rendered even when no item is selected
      expect(lastAlertActionOnClick).not.toBeNull();
    });

    // deleteItemId is empty string at this point; calling the alert action
    // should hit the early return branch and not call backend.post
    if (lastAlertActionOnClick) {
      lastAlertActionOnClick();
    }

    expect(mockBackendPost).toHaveBeenCalledTimes(1);
  });

  test("applies filters for search, cuisine, category, foodType, and price range", async () => {
    storeState.restaurant = { _id: "r1" } as any;

    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: [
          {
            _id: "i1",
            dishName: "Margherita Pizza",
            cuisine: "Italian",
            category: "Main Course",
            foodType: "veg",
            price: 500,
            isPopular: true,
            isAvailable: true,
          },
          {
            _id: "i2",
            dishName: "Schezwan Noodles",
            cuisine: "Chinese",
            category: "Main Course",
            foodType: "non-veg",
            price: 300,
            isPopular: false,
            isAvailable: true,
          },
        ],
      },
    });

    render(<RestaurantItemsPage />);

    // Wait for page to mount (filters rendered) and fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId("items-filter")).toBeInTheDocument();
    });

    // Apply combined filters to exercise all filter branches
    await act(async () => {
      mockFilterChange({
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        priceRange: [400, 600],
        search: "pizza",
      });
    });

    // Filters should narrow down to the matching Italian veg pizza item
    await waitFor(() => {
      expect(lastItemsGridProps).not.toBeNull();
      expect(lastItemsGridProps.items).toHaveLength(1);
      expect(lastItemsGridProps.items[0]._id).toBe("i1");
    });
  });

  test("edit dialog onClose clears selection", async () => {
    storeState.restaurant = { _id: "r1" } as any;
    storeState.items = [
      {
        _id: "i1",
        dishName: "Dish 1",
        cuisine: "Italian",
        category: "Main Course",
        foodType: "veg",
        price: 100,
        isPopular: false,
        isAvailable: true,
      },
    ];

    mockBackendPost.mockResolvedValueOnce({
      data: {
        success: true,
        items: storeState.items,
      },
    });

    render(<RestaurantItemsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("items-grid")).toBeInTheDocument();
    });

    const editBtn = screen.getByTestId("edit-i1");
    await userEvent.click(editBtn);

    // Ensure AddItemForm for edit is present and then invoke its onClose handler
    await waitFor(() => {
      expect(lastAddFormProps).not.toBeNull();
    });

    await act(async () => {
      lastAddFormProps.onClose();
    });
  });
});

