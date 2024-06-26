import { FC } from 'react';
import Card from '../UI/Card';
import classes from './Cart.module.scss';
import CartItem from './CartItem';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store/index';
import { ICartItem } from './CartItem';
const Cart: FC = () => {
    const cartItems = useAppSelector((state: RootState) => state.cart.items);
    return (
        <Card className={classes.cart}>
            <h2>Your Shopping Cart</h2>
            <ul>
                {cartItems.map((item: ICartItem) => (
                    <CartItem key={item.id} item={item} />
                ))}
            </ul>
        </Card>
    );
};

export default Cart;
