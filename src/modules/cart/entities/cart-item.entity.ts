export interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency: string;
}

export class CartItem {
  private readonly props: CartItemProps;

  constructor(props: CartItemProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get currency(): string {
    return this.props.currency;
  }

  toJSON(): CartItemProps {
    return { ...this.props };
  }
}
