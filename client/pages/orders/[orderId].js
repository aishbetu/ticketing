import {useEffect, useState} from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders'),
    });
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }
    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout
                token={({ type }) => doRequest({ token: type })}
                stripeKey={"pk_test_51Kl9KKSAq77U8IIaIFhW3SQIlWghaOs7nHeBXj4ZvicfDf8EoXdrAUDfPNEZhFbpBCVcYsGY22I59eSJ2sur8KyS00dsWMlE2G"}
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors }
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default OrderShow;
