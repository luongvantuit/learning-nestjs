export interface CartInterface {
  cartId: string;

  userId: string;

  quantity: number;

  amount: number;

  sellerId: string;

  product: {
    productId: string;

    description: string;

    brand: string;

    photos: string[];

    category: string[];

    name: string;

    createAt: Date;
  };

  classify: {
    classifyId: string;

    name: string;

    link: string;

    price: string;
  };

  seller: SellerInterface;
}

export interface SellerInterface {
  email: string;
}
